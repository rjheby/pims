import { format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { createDeliveryStop } from "./scheduleUtils";

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
    
    // Get all active recurring orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone
        )
      `)
      .eq('active_status', true);
      
    if (ordersError) {
      console.error(`Error fetching active orders: ${ordersError.message}`);
      return {
        success: false,
        stopsCreated: 0,
        error: ordersError.message
      };
    }
    
    if (!activeOrders || activeOrders.length === 0) {
      console.log('No active recurring orders found');
      return {
        success: true,
        stopsCreated: 0
      };
    }
    
    console.log(`Found ${activeOrders.length} active recurring orders`);
    
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
    
    // Process each order
    let stopsCreated = 0;
    const targetDate = new Date(dateStr);
    
    for (const order of activeOrders) {
      if (!order.preferred_day) {
        console.warn(`Order ${order.id} has no preferred_day, skipping`);
        continue;
      }
      
      if (!order.customer || !order.customer.id) {
        console.warn(`Order ${order.id} has no customer data, skipping`);
        continue;
      }
      
      console.log(`Processing order ${order.id} (${order.customer.name})`);
      
      // Calculate if this recurring order applies to the selected date
      const occurrences = calculateNextOccurrences(
        startOfDay(targetDate),
        order.frequency,
        order.preferred_day,
        1
      );
      
      if (occurrences.length === 0) {
        console.log(`No occurrences found for order ${order.id}`);
        continue;
      }
      
      const occurrenceDate = occurrences[0];
      const isMatch = isSameDay(occurrenceDate, targetDate);
      
      if (!isMatch) {
        console.log(`Order ${order.id} does not match date ${dateStr}`);
        continue;
      }
      
      console.log(`Order ${order.id} matches date ${dateStr}, creating stop`);
      
      // Use the new createDeliveryStop function with transaction handling
      const result = await createDeliveryStop(
        scheduleInfo.scheduleId,
        {
          id: order.customer.id,
          name: order.customer.name,
          address: order.customer.address,
          phone: order.customer.phone
        },
        order.items || '',
        true,
        order.id
      );
      
      if (result.success) {
        stopsCreated++;
        console.log(`Successfully created stop for order ${order.id}`);
      } else {
        console.error(`Failed to create stop for order ${order.id}: ${result.error}`);
      }
    }
    
    return {
      success: true,
      stopsCreated
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
