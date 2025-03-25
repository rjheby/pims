
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
