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
    const targetDate = startOfDay(date);
    
    for (const order of activeOrders) {
      if (!order.preferred_day) {
        console.warn(`Order ${order.id} has no preferred_day, skipping`);
        continue;
      }
      
      console.log(`Checking if order ${order.id} (${order.customer?.name}) applies to ${dateStr}`);
      console.log(`Order details: Frequency=${order.frequency}, Preferred day=${order.preferred_day}`);
      
      // Calculate if this recurring order applies to the selected date
      const occurrences = calculateNextOccurrences(
        new Date(dateStr), // Use exact date
        order.frequency,
        order.preferred_day,
        1
      );
      
      // Debug the occurrences calculation
      if (occurrences.length > 0) {
        const occurrenceDate = occurrences[0];
        console.log(`Calculated occurrence: ${format(occurrenceDate, 'yyyy-MM-dd')} for order ${order.id}`);
        console.log(`Target date: ${format(targetDate, 'yyyy-MM-dd')}`);
        
        // For weekly/bi-weekly orders, we need to check if the day of week matches
        let isMatch = false;
        
        if (order.frequency.toLowerCase().includes('weekly')) {
          // For weekly/bi-weekly, check if day of week matches
          const orderDayIndex = getDayOfWeekIndex(order.preferred_day);
          const targetDayIndex = date.getDay();
          isMatch = orderDayIndex === targetDayIndex;
          console.log(`Weekly order: Day of week match? ${isMatch} (${orderDayIndex} vs ${targetDayIndex})`);
        } else {
          // For other frequencies, use isSameDay
          isMatch = isSameDay(occurrenceDate, targetDate);
          console.log(`Non-weekly order: Date match? ${isMatch}`);
        }
        
        if (isMatch) {
          console.log(`Order ${order.id} (${order.customer?.name}) MATCHES date ${dateStr}`);
          matchingOrders.push(order);
        } else {
          console.log(`Order ${order.id} (${order.customer?.name}) does NOT match date ${dateStr}`);
        }
      } else {
        console.log(`No occurrences found for order ${order.id} from date ${dateStr}`);
      }
    }
    
    console.log(`Found ${matchingOrders.length} orders that match date ${dateStr}`);
    
    if (matchingOrders.length === 0) {
      return {
        success: true,
        stopsCreated: 0
      };
    }
    
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
    
    // Process each matching order
    let stopsCreated = 0;
    
    for (const order of matchingOrders) {
      if (!order.customer || !order.customer.id) {
        console.warn(`Order ${order.id} has no customer data, skipping stop creation`);
        continue;
      }
      
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
      } else {
        console.log(`Order ${order.id} already linked to schedule ${scheduleInfo.scheduleId}`);
      }
      
      // Then check if a stop already exists for this customer
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
