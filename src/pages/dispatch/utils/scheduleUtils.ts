import { supabase } from "@/integrations/supabase/client";
import { format, parse, isSameDay, startOfDay } from "date-fns";
import { calculateNextOccurrences } from "./recurringOccurrenceUtils";

/**
 * Find schedules (both regular and recurring) for a specific date
 */
export const findSchedulesForDate = async (date: Date): Promise<any[]> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log(`Finding schedules for date: ${dateStr}`);
    
    // First, find regular schedules for this date
    const { data: regularSchedules, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select(`
        *,
        recurring_schedules:recurring_order_schedules(recurring_order_id)
      `)
      .eq('schedule_date', dateStr);
      
    if (scheduleError) {
      console.error("Error finding regular schedules:", scheduleError);
      throw scheduleError;
    }
    
    const schedules = regularSchedules || [];
    console.log(`Found ${schedules.length} regular schedules for date ${dateStr}`);
    
    // Now check for recurring orders that should occur on this date
    const { data: recurringOrders, error: recurringError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('active_status', true);
      
    if (recurringError) {
      console.error("Error finding recurring orders:", recurringError);
      throw recurringError;
    }
    
    if (recurringOrders && recurringOrders.length > 0) {
      console.log(`Found ${recurringOrders.length} active recurring orders to check for date ${dateStr}`);
      
      // For automatic schedule creation - if needed and no schedules exist yet
      if (schedules.length === 0) {
        console.log("No existing schedules for this date, checking for recurring orders that apply");
        const recurringOrdersForDate: any[] = [];
        
        // For each recurring order, check if it should occur on the selected date
        for (const order of recurringOrders) {
          if (!order.preferred_day) {
            console.warn(`Order ${order.id} has no preferred_day, skipping`);
            continue;
          }
          
          console.log(`Checking if recurring order ${order.id} (${order.customer?.name || 'Unknown'}) applies to ${dateStr}`);
          console.log(`Order details: Frequency=${order.frequency}, Preferred day=${order.preferred_day}`);
          
          // Calculate if this recurring order applies to the selected date
          const occurrences = calculateNextOccurrences(
            startOfDay(new Date(dateStr)),
            order.frequency,
            order.preferred_day,
            1 // We just need to check if today is a match
          );
          
          if (occurrences.length > 0) {
            const occurrenceDate = occurrences[0];
            const isMatch = isSameDay(occurrenceDate, new Date(dateStr));
            console.log(`Calculated occurrence date: ${occurrenceDate.toISOString()}, is match for ${dateStr}: ${isMatch}`);
            
            if (isMatch) {
              console.log(`Recurring order ${order.id} (${order.customer?.name || 'Unknown'}) MATCHES date ${dateStr}`);
              recurringOrdersForDate.push(order);
            }
          } else {
            console.log(`No occurrences found for order ${order.id} from date ${dateStr}`);
          }
        }
        
        console.log(`Found ${recurringOrdersForDate.length} recurring orders for date ${dateStr}`);
        
        // If we have recurring orders for this date but no existing schedule
        if (recurringOrdersForDate.length > 0) {
          console.log("Creating a consolidated schedule for recurring orders");
          // Create a consolidated schedule for this date
          const scheduleInfo = await consolidateRecurringOrders(dateStr);
          
          if (scheduleInfo) {
            // Fetch the newly created or existing schedule
            const { data: newSchedule, error: fetchError } = await supabase
              .from('dispatch_schedules')
              .select('*')
              .eq('id', scheduleInfo.scheduleId)
              .single();
              
            if (!fetchError && newSchedule) {
              schedules.push(newSchedule);
              console.log(`Added new schedule ID ${newSchedule.id} to results`);
              
              // Create recurring order links and delivery stops for each order
              for (const order of recurringOrdersForDate) {
                console.log(`Processing recurring order ${order.id} (${order.customer?.name || 'Unknown'}) for schedule ${newSchedule.id}`);
                
                if (!order.customer || !order.customer.id) {
                  console.warn(`Order ${order.id} has no customer data, skipping`);
                  continue;
                }
                
                // Link the recurring order to this schedule
                const { error: linkError } = await supabase
                  .from('recurring_order_schedules')
                  .insert({
                    recurring_order_id: order.id,
                    schedule_id: scheduleInfo.scheduleId,
                    status: 'active'
                  });
                  
                if (linkError) {
                  console.error(`Error linking recurring order to schedule: ${linkError.message}`);
                  continue;
                }
                
                // Add a delivery stop for this customer
                console.log(`Creating delivery stop for ${order.customer.name}`);
                
                // Get the items from the recurring order
                const items = order.items || '';
                console.log(`Using items for recurring order: ${items}`);
                
                const stopData = {
                  master_schedule_id: scheduleInfo.scheduleId,
                  customer_id: order.customer.id,
                  customer_name: order.customer.name,
                  customer_address: order.customer.address || '',
                  customer_phone: order.customer.phone || '',
                  status: 'pending',
                  is_recurring: true,
                  recurring_id: order.id,
                  items: items, // Ensure items is included
                  notes: `Auto-generated from recurring order (${order.frequency})`
                };
                
                console.log(`Creating stop with data: ${JSON.stringify(stopData)}`);
                
                const { error: stopError } = await supabase
                  .from('delivery_stops')
                  .insert(stopData);
                  
                if (stopError) {
                  console.error(`Error creating delivery stop: ${stopError.message}`);
                } else {
                  console.log(`Successfully created delivery stop for ${order.customer.name}`);
                }
              }
            } else {
              console.error("Failed to fetch newly created schedule:", fetchError);
            }
          } else {
            console.error("Failed to consolidate recurring orders into a schedule");
          }
        }
      } else {
        console.log(`Using existing schedule for date ${dateStr}`);
        // We have existing schedules - check if any recurring orders should be added to them
        const targetSchedule = schedules[0]; // Use the first schedule
        console.log(`Target schedule ID: ${targetSchedule.id}`);
        
        for (const order of recurringOrders) {
          if (!order.preferred_day) {
            console.warn(`Order ${order.id} has no preferred_day, skipping`);
            continue;
          }
          
          if (!order.customer || !order.customer.id) {
            console.warn(`Order ${order.id} has no customer data, skipping`);
            continue;
          }
          
          console.log(`Checking if recurring order ${order.id} (${order.customer.name}) applies to ${dateStr}`);
          
          // Check if this recurring order applies to the selected date
          const occurrences = calculateNextOccurrences(
            startOfDay(new Date(dateStr)),
            order.frequency,
            order.preferred_day,
            1
          );
          
          if (occurrences.length > 0 && isSameDay(occurrences[0], new Date(dateStr))) {
            console.log(`Recurring order ${order.id} MATCHES date ${dateStr}`);
            
            // Check if this recurring order is already linked to this schedule
            const { data: existingLinks, error: linkQueryError } = await supabase
              .from('recurring_order_schedules')
              .select('*')
              .eq('recurring_order_id', order.id)
              .eq('schedule_id', targetSchedule.id);
              
            if (linkQueryError) {
              console.error(`Error checking for existing links: ${linkQueryError.message}`);
              continue;
            }
            
            if (!existingLinks || existingLinks.length === 0) {
              console.log(`Linking recurring order ${order.id} to schedule ${targetSchedule.id}`);
              
              // Link the recurring order to this schedule
              const { error: linkError } = await supabase
                .from('recurring_order_schedules')
                .insert({
                  recurring_order_id: order.id,
                  schedule_id: targetSchedule.id,
                  status: 'active'
                });
                
              if (linkError) {
                console.error(`Error linking order to schedule: ${linkError.message}`);
                continue;
              }
            } else {
              console.log(`Recurring order ${order.id} is already linked to schedule ${targetSchedule.id}`);
            }
            
            // Check if a stop already exists for this customer
            const { data: existingStops, error: stopQueryError } = await supabase
              .from('delivery_stops')
              .select('*')
              .eq('master_schedule_id', targetSchedule.id)
              .eq('customer_id', order.customer.id);
              
            if (stopQueryError) {
              console.error(`Error checking for existing stops: ${stopQueryError.message}`);
              continue;
            }
            
            if (!existingStops || existingStops.length === 0) {
              console.log(`Creating delivery stop for ${order.customer.name} in schedule ${targetSchedule.id}`);
              
              // Get the items from the recurring order
              const items = order.items || '';
              console.log(`Using items for recurring order: ${items}`);
              
              // Create a delivery stop for this customer
              const stopData = {
                master_schedule_id: targetSchedule.id,
                customer_id: order.customer.id,
                customer_name: order.customer.name,
                customer_address: order.customer.address || '',
                customer_phone: order.customer.phone || '',
                status: 'pending',
                is_recurring: true,
                recurring_id: order.id,
                items: items, // Ensure items is included
                notes: `Auto-generated from recurring order (${order.frequency})`
              };
              
              console.log(`Creating stop with data: ${JSON.stringify(stopData)}`);
              
              const { error: stopError } = await supabase
                .from('delivery_stops')
                .insert(stopData);
                
              if (stopError) {
                console.error(`Error creating delivery stop: ${stopError.message}`);
              } else {
                console.log(`Successfully created delivery stop for ${order.customer.name}`);
              }
            } else {
              console.log(`Delivery stop for ${order.customer.name} already exists in schedule ${targetSchedule.id}`);
            }
          } else {
            console.log(`Recurring order ${order.id} does NOT match date ${dateStr}`);
          }
        }
      }
    } else {
      console.log("No active recurring orders found");
    }
    
    return schedules;
  } catch (error) {
    console.error('Error finding schedules for date:', error);
    return [];
  }
};

/**
 * Helper function to find schedules for a specific date (returns basic schedule info)
 */
export const findSchedulesForDateBasic = async (dateStr: string): Promise<Array<{
  id: string;
  schedule_date: string;
  status: string;
  schedule_number: string;
}>> => {
  try {
    const { data, error } = await supabase
      .from('dispatch_schedules')
      .select('id, schedule_date, status, schedule_number')
      .eq('schedule_date', dateStr);
    
    if (error) {
      console.error("Error finding schedules:", error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Error in findSchedulesForDateBasic:", err);
    return [];
  }
};

/**
 * Create a new schedule for a specific date
 */
export const createScheduleForDate = async (dateStr: string) => {
  // Use the dateStr to generate the schedule number, ensuring consistency
  const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  const formattedDate = format(parsedDate, 'yyyyMMdd');
  const scheduleNumber = `SCH-${formattedDate}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  const { data, error } = await supabase
    .from('dispatch_schedules')
    .insert({
      schedule_date: dateStr,
      status: 'draft',
      schedule_number: scheduleNumber,
      notes: `Schedule for ${format(parsedDate, 'MMMM d, yyyy')}`
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
  
  return data;
};

/**
 * Consolidate recurring orders to a single schedule for a date
 * This function ensures only one schedule exists per date
 */
export const consolidateRecurringOrders = async (dateStr: string) => {
  try {
    console.log(`Consolidating recurring orders for date ${dateStr}`);
    
    // Get existing schedules for this date
    const existingSchedules = await findSchedulesForDateBasic(dateStr);
    
    // Check if we have any existing schedules
    if (existingSchedules && existingSchedules.length > 0) {
      // Use the first schedule found for this date
      const firstSchedule = existingSchedules[0];
      
      // Validate that we have a schedule
      if (!firstSchedule) {
        throw new Error("Schedule exists but couldn't be retrieved");
      }
      
      console.log(`Found existing schedule for ${dateStr}: ${firstSchedule.schedule_number}`);
      
      return {
        scheduleId: firstSchedule.id,
        scheduleDateFormatted: dateStr,
        scheduleStatus: firstSchedule.status,
        scheduleNumber: firstSchedule.schedule_number
      };
    } else {
      // No existing schedule found, create a new one
      console.log(`No existing schedule found for ${dateStr}, creating new one`);
      
      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
      const formattedDate = format(parsedDate, 'yyyyMMdd');
      const scheduleNumber = `SCH-${formattedDate}-REC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const { data: newSchedule, error } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_date: dateStr,
          status: 'draft',
          schedule_number: scheduleNumber,
          notes: `Auto-generated for recurring orders on ${format(parsedDate, 'MMMM d, yyyy')}`
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating consolidated schedule:", error);
        throw error;
      }
      
      console.log(`Created new schedule for ${dateStr}: ${newSchedule.schedule_number}`);
      
      return {
        scheduleId: newSchedule.id,
        scheduleDateFormatted: dateStr,
        scheduleStatus: newSchedule.status,
        scheduleNumber: newSchedule.schedule_number
      };
    }
  } catch (error) {
    console.error("Error consolidating recurring orders:", error);
    return null;
  }
};
