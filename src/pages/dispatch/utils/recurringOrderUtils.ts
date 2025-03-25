
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
