import { supabase } from "@/integrations/supabase/client";
import { format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";

// Import and re-export from our utility modules
import { 
  calculateNextOccurrences,
  getDayOfWeekIndex,
  getNextDayOfWeek,
  getNextDayOfMonth,
  getNextMonthlyOccurrence,
  checkDateForRecurringOrders
} from './recurringOccurrenceUtils';

import {
  createRecurringOrderFromSchedule,
  updateRecurringSchedule,
  syncAllRecurringOrders,
  getUpcomingSchedulesForRecurringOrder
} from './recurringOrderCreationUtils';

import {
  findSchedulesForDate,
  findSchedulesForDateBasic,
  createScheduleForDate,
  consolidateRecurringOrders
} from './scheduleUtils';

// Re-export all the functions
export {
  calculateNextOccurrences,
  getDayOfWeekIndex,
  getNextDayOfWeek,
  getNextDayOfMonth,
  getNextMonthlyOccurrence,
  checkDateForRecurringOrders,
  createRecurringOrderFromSchedule,
  updateRecurringSchedule,
  syncAllRecurringOrders,
  getUpcomingSchedulesForRecurringOrder,
  findSchedulesForDate,
  findSchedulesForDateBasic,
  createScheduleForDate,
  consolidateRecurringOrders
};

/**
 * Get upcoming dispatch schedules for a recurring order
 * Implementation moved to this file to avoid circular dependencies
 */
export const getUpcomingSchedulesForRecurringOrder = async (
  recurringOrderId: string
): Promise<any[]> => {
  try {
    // Get links between recurring order and schedules
    const { data: links, error: linkError } = await supabase
      .from('recurring_order_schedules')
      .select(`
        id,
        schedule_id,
        status,
        schedule:schedule_id (
          id,
          schedule_date,
          status,
          schedule_number
        )
      `)
      .eq('recurring_order_id', recurringOrderId)
      .order('created_at', { ascending: false });
      
    if (linkError) throw linkError;
    
    if (!links || links.length === 0) {
      return [];
    }
    
    // Filter out schedules in the past
    const today = startOfDay(new Date());
    
    return links
      .filter(link => {
        if (!link.schedule || !link.schedule.schedule_date) return false;
        const scheduleDate = parse(link.schedule.schedule_date, 'yyyy-MM-dd', new Date());
        return !isBefore(scheduleDate, today);
      })
      .map(link => link.schedule);
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    return [];
  }
};

/**
 * Check if a specific date has any recurring orders
 * Implementation moved to this file to avoid circular dependencies
 */
export const checkDateForRecurringOrders = async (date: Date): Promise<boolean> => {
  try {
    // Get all active recurring orders
    const { data: recurringOrders, error } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('active_status', true);
      
    if (error) throw error;
    
    if (!recurringOrders || recurringOrders.length === 0) {
      return false;
    }
    
    // Check if any recurring order matches this date
    for (const order of recurringOrders) {
      const occurrences = calculateNextOccurrences(
        new Date(),
        order.frequency,
        order.preferred_day,
        5 // Look ahead a few occurrences
      );
      
      // Fixed: Now properly checking each occurrence individually
      for (const occurrence of occurrences) {
        if (isSameDay(occurrence, date)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking recurring orders for date:', error);
    return false;
  }
};
