import { supabase } from "@/integrations/supabase/client";
import { format, parse, isSameDay, startOfDay } from "date-fns";
import { calculateNextOccurrences } from "./recurringOccurrenceUtils";

/**
 * Find schedules (both regular and recurring) for a specific date
 */
export const findSchedulesForDate = async (date: Date): Promise<any[]> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // First, find regular schedules for this date
    const { data: regularSchedules, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select(`
        *,
        recurring_schedules:recurring_order_schedules(recurring_order_id)
      `)
      .eq('schedule_date', dateStr);
      
    if (scheduleError) throw scheduleError;
    
    const schedules = regularSchedules || [];
    
    // Now check for recurring orders that should occur on this date
    // but don't have a schedule created yet
    const { data: recurringOrders, error: recurringError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('active_status', true);
      
    if (recurringError) throw recurringError;
    
    if (recurringOrders && recurringOrders.length > 0) {
      // For automatic schedule creation - if needed and no schedules exist yet
      if (schedules.length === 0) {
        const recurringOrdersForDate: any[] = [];
        
        // For each recurring order, check if it should occur on the selected date
        for (const order of recurringOrders) {
          // Calculate if this recurring order applies to the selected date
          const occurrences = calculateNextOccurrences(
            new Date(dateStr),
            order.frequency,
            order.preferred_day,
            1 // We just need to check if today is a match
          );
          
          if (occurrences.length > 0 && isSameDay(occurrences[0], date)) {
            recurringOrdersForDate.push(order);
          }
        }
        
        // If we have recurring orders for this date but no existing schedule
        if (recurringOrdersForDate.length > 0) {
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
              
              // Create recurring order links and delivery stops for each order
              for (const order of recurringOrdersForDate) {
                // Link the recurring order to this schedule
                await supabase
                  .from('recurring_order_schedules')
                  .insert({
                    recurring_order_id: order.id,
                    schedule_id: scheduleInfo.scheduleId,
                    status: 'active'
                  });
                  
                // Add a delivery stop for this customer
                if (order.customer) {
                  await supabase
                    .from('delivery_stops')
                    .insert({
                      master_schedule_id: scheduleInfo.scheduleId,
                      customer_id: order.customer.id,
                      customer_name: order.customer.name,
                      customer_address: order.customer.address || '',
                      customer_phone: order.customer.phone || '',
                      status: 'pending',
                      is_recurring: true,
                      recurring_id: order.id,
                      notes: `Auto-generated from recurring order (${order.frequency})`
                    });
                }
              }
            }
          }
        }
      } else {
        // We have existing schedules - check if any recurring orders should be added to them
        const targetSchedule = schedules[0]; // Use the first schedule
        
        for (const order of recurringOrders) {
          // Check if this recurring order applies to the selected date
          const occurrences = calculateNextOccurrences(
            new Date(dateStr),
            order.frequency,
            order.preferred_day,
            1
          );
          
          if (occurrences.length > 0 && isSameDay(occurrences[0], date)) {
            // Check if this recurring order is already linked to this schedule
            const { data: existingLinks } = await supabase
              .from('recurring_order_schedules')
              .select('*')
              .eq('recurring_order_id', order.id)
              .eq('schedule_id', targetSchedule.id);
              
            if (!existingLinks || existingLinks.length === 0) {
              // Link the recurring order to this schedule
              await supabase
                .from('recurring_order_schedules')
                .insert({
                  recurring_order_id: order.id,
                  schedule_id: targetSchedule.id,
                  status: 'active'
                });
            }
            
            // Check if a stop already exists for this customer
            const { data: existingStops } = await supabase
              .from('delivery_stops')
              .select('*')
              .eq('master_schedule_id', targetSchedule.id)
              .eq('customer_id', order.customer.id);
              
            if (!existingStops || existingStops.length === 0) {
              // Create a delivery stop for this customer
              if (order.customer) {
                await supabase
                  .from('delivery_stops')
                  .insert({
                    master_schedule_id: targetSchedule.id,
                    customer_id: order.customer.id,
                    customer_name: order.customer.name,
                    customer_address: order.customer.address || '',
                    customer_phone: order.customer.phone || '',
                    status: 'pending',
                    is_recurring: true,
                    recurring_id: order.id,
                    notes: `Auto-generated from recurring order (${order.frequency})`
                  });
              }
            }
          }
        }
      }
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
