
import { format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";

// Import from utility modules
import { 
  calculateNextOccurrences,
  getDayOfWeekIndex,
  getNextDayOfWeek,
  getNextDayOfMonth,
  getNextMonthlyOccurrence,
  checkDateForRecurringOrders
} from './recurringOccurrenceUtils';

// Import from recurring order creation utils
import {
  createRecurringOrderFromSchedule,
  updateRecurringSchedule,
  syncAllRecurringOrders,
  getUpcomingSchedulesForRecurringOrder
} from './recurringOrderCreationUtils';

// Import from schedule utils
import {
  findSchedulesForDate,
  findSchedulesForDateBasic,
  createScheduleForDate,
  consolidateRecurringOrders
} from './scheduleUtils';

/**
 * Force synchronization of all recurring orders for a specific date
 * This is a more direct approach to ensure stops are created for a date
 */
export const forceSyncForDate = async (date: Date): Promise<{
  success: boolean;
  stopsCreated: number;
  error?: string;
}> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    console.log(`Force syncing recurring orders for date: ${dateStr}`);
    
    // Get or create a schedule for this date
    let scheduleInfo = await consolidateRecurringOrders(dateStr);
    
    if (!scheduleInfo) {
      console.error("Failed to get or create schedule for date:", dateStr);
      return {
        success: false,
        stopsCreated: 0,
        error: "Failed to create or find schedule for the specified date"
      };
    }
    
    console.log(`Using schedule ID ${scheduleInfo.scheduleId} for sync operation`);
    
    // Import from Supabase (can't be at top level due to circular dependencies)
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Get all active recurring orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('active_status', true);
      
    if (ordersError) {
      console.error("Error fetching recurring orders:", ordersError);
      return {
        success: false,
        stopsCreated: 0,
        error: `Failed to fetch recurring orders: ${ordersError.message}`
      };
    }
    
    if (!activeOrders || activeOrders.length === 0) {
      console.log("No active recurring orders found");
      return { 
        success: true, 
        stopsCreated: 0 
      };
    }
    
    console.log(`Found ${activeOrders.length} active recurring orders to check`);
    
    // Find orders that should occur on this date
    const matchingOrders = [];
    for (const order of activeOrders) {
      if (!order.preferred_day) {
        console.warn(`Order ${order.id} has no preferred_day, skipping`);
        continue;
      }
      
      console.log(`Checking if order ${order.id} (${order.customer?.name}) applies to ${dateStr}`);
      console.log(`Order details: Frequency=${order.frequency}, Preferred day=${order.preferred_day}`);
      
      // Calculate if this recurring order applies to the selected date
      const occurrences = calculateNextOccurrences(
        startOfDay(date),
        order.frequency,
        order.preferred_day,
        1
      );
      
      if (occurrences.length > 0) {
        const occurrenceDate = occurrences[0];
        const isMatch = isSameDay(occurrenceDate, date);
        console.log(`Calculated occurrence: ${occurrenceDate.toISOString()}, is match: ${isMatch}`);
        
        if (isMatch) {
          console.log(`Order ${order.id} (${order.customer?.name}) MATCHES date ${dateStr}`);
          matchingOrders.push(order);
        }
      }
    }
    
    console.log(`Found ${matchingOrders.length} orders that match date ${dateStr}`);
    
    // Process each matching order
    let stopsCreated = 0;
    for (const order of matchingOrders) {
      // First ensure the order is linked to the schedule
      const { data: existingLinks, error: linkQueryError } = await supabase
        .from('recurring_order_schedules')
        .select('id')
        .eq('recurring_order_id', order.id)
        .eq('schedule_id', scheduleInfo.scheduleId);
        
      if (linkQueryError) {
        console.error(`Error checking for existing links: ${linkQueryError.message}`);
        continue;
      }
      
      if (!existingLinks || existingLinks.length === 0) {
        console.log(`Linking order ${order.id} to schedule ${scheduleInfo.scheduleId}`);
        
        const { error: linkError } = await supabase
          .from('recurring_order_schedules')
          .insert({
            recurring_order_id: order.id,
            schedule_id: scheduleInfo.scheduleId,
            status: 'active'
          });
          
        if (linkError) {
          console.error(`Error linking order to schedule: ${linkError.message}`);
          continue;
        }
      }
      
      // Then check if a stop already exists for this customer
      if (!order.customer || !order.customer.id) {
        console.warn(`Order ${order.id} has no customer data, skipping stop creation`);
        continue;
      }
      
      const { data: existingStops, error: stopQueryError } = await supabase
        .from('delivery_stops')
        .select('id')
        .eq('master_schedule_id', scheduleInfo.scheduleId)
        .eq('customer_id', order.customer.id);
        
      if (stopQueryError) {
        console.error(`Error checking for existing stops: ${stopQueryError.message}`);
        continue;
      }
      
      if (!existingStops || existingStops.length === 0) {
        console.log(`Creating stop for customer ${order.customer.name} in schedule ${scheduleInfo.scheduleId}`);
        
        const { error: stopError } = await supabase
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
          
        if (stopError) {
          console.error(`Error creating stop: ${stopError.message}`);
          continue;
        }
        
        stopsCreated++;
        console.log(`Successfully created stop for ${order.customer.name}`);
      } else {
        console.log(`Stop for customer ${order.customer.name} already exists`);
      }
    }
    
    return {
      success: true,
      stopsCreated,
    };
  } catch (error: any) {
    console.error("Error in forceSyncForDate:", error);
    return {
      success: false,
      stopsCreated: 0,
      error: error.message || "An unknown error occurred"
    };
  }
};

// Re-export all the utility functions
export {
  // Core date-fns exports that might be needed
  format,
  parse,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  endOfDay,
  isSameDay,
  
  // From recurringOccurrenceUtils.ts
  calculateNextOccurrences,
  getDayOfWeekIndex,
  getNextDayOfWeek,
  getNextDayOfMonth,
  getNextMonthlyOccurrence,
  checkDateForRecurringOrders,
  
  // From recurringOrderCreationUtils.ts
  createRecurringOrderFromSchedule,
  updateRecurringSchedule,
  syncAllRecurringOrders,
  getUpcomingSchedulesForRecurringOrder,
  
  // From scheduleUtils.ts
  findSchedulesForDate,
  findSchedulesForDateBasic,
  createScheduleForDate,
  consolidateRecurringOrders
};
