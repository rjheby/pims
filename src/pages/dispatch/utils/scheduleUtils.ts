
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
      // Consolidate all recurring orders for this date into a single schedule
      let consolidatedSchedule = null;
      const recurringOrdersForDate: any[] = [];
      
      // For each recurring order, check if it should occur on this date
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
      if (recurringOrdersForDate.length > 0 && schedules.length === 0) {
        // Create a single consolidated schedule for this date
        const { data: newSchedule, error: createError } = await supabase
          .from('dispatch_schedules')
          .insert({
            schedule_date: dateStr,
            status: 'draft',
            schedule_number: `SCH-${dateStr.replace(/-/g, '')}-REC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            notes: `Auto-generated for recurring orders on ${dateStr}`
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating consolidated schedule:', createError);
        } else if (newSchedule) {
          consolidatedSchedule = newSchedule;
          schedules.push(newSchedule);
          
          // Add all recurring orders to this consolidated schedule
          for (const order of recurringOrdersForDate) {
            // Link the recurring order to this schedule
            await supabase
              .from('recurring_order_schedules')
              .insert({
                recurring_order_id: order.id,
                schedule_id: newSchedule.id,
                status: 'active'
              });
              
            // Create a delivery stop for this customer
            if (order.customer) {
              await supabase
                .from('delivery_stops')
                .insert({
                  master_schedule_id: newSchedule.id,
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
      } else if (recurringOrdersForDate.length > 0 && schedules.length > 0) {
        // We have existing schedules, add recurring orders to the first one
        const targetSchedule = schedules[0];
        
        for (const order of recurringOrdersForDate) {
          // Check if this recurring order is already in this schedule
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
  const scheduleNumber = `SCH-${dateStr.replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  const { data, error } = await supabase
    .from('dispatch_schedules')
    .insert({
      schedule_date: dateStr,
      status: 'draft',
      schedule_number: scheduleNumber,
      notes: `Schedule for ${dateStr}`
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
 */
export const consolidateRecurringOrders = async (dateStr: string) => {
  try {
    // Get existing schedules for this date
    const existingSchedules = await findSchedulesForDateBasic(dateStr);
    
    // Define schedule type explicitly to help TypeScript
    type ScheduleType = {
      id: string;
      schedule_date: string;
      status: string;
      schedule_number: string;
    };
    
    // Check if we have any existing schedules
    if (existingSchedules && existingSchedules.length > 0) {
      // Use the first schedule found for this date
      const firstSchedule = existingSchedules[0] as ScheduleType;
      
      // Validate that we have a schedule
      if (!firstSchedule) {
        throw new Error("Schedule exists but couldn't be retrieved");
      }
      
      return {
        scheduleId: firstSchedule.id,
        scheduleDateFormatted: format(new Date(firstSchedule.schedule_date), 'yyyy-MM-dd'),
        scheduleStatus: firstSchedule.status,
        scheduleNumber: firstSchedule.schedule_number
      };
    } else {
      // No existing schedule found, create a new one
      const newSchedule = await createScheduleForDate(dateStr);
      return {
        scheduleId: newSchedule.id,
        scheduleDateFormatted: format(new Date(newSchedule.schedule_date), 'yyyy-MM-dd'),
        scheduleStatus: newSchedule.status,
        scheduleNumber: newSchedule.schedule_number
      };
    }
  } catch (error) {
    console.error("Error consolidating recurring orders:", error);
    return null;
  }
};
