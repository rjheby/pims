import { addWeeks, addMonths, format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

/**
 * Convert a day name to its index (0 = Sunday, 1 = Monday, etc.)
 */
export const getDayOfWeekIndex = (day: string): number => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const index = days.indexOf(day.toLowerCase());
  
  if (index === -1) {
    console.warn(`Invalid day name: ${day}`);
  }
  
  return index;
};

/**
 * Get the next occurrence of a specific day of week
 */
export const getNextDayOfWeek = (date: Date, dayOfWeek: number): Date => {
  const resultDate = new Date(date);
  const currentDay = resultDate.getDay();
  
  // If target day is same as current day, return current date
  if (currentDay === dayOfWeek) {
    return resultDate;
  }
  
  // Calculate days to add - if target day is before current day, add days to get to next week
  const daysToAdd = (7 + dayOfWeek - currentDay) % 7;
  resultDate.setDate(date.getDate() + daysToAdd);
  
  return resultDate;
};

/**
 * Get the next occurrence of a specific day of month
 */
export const getNextDayOfMonth = (date: Date, dayOfMonth: number): Date => {
  const resultDate = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);
  
  // If the date is in the past, move to next month
  if (isBefore(resultDate, date)) {
    resultDate.setMonth(resultDate.getMonth() + 1);
  }
  
  return resultDate;
};

/**
 * Get the next occurrence of a monthly pattern like "first monday"
 */
export const getNextMonthlyOccurrence = (date: Date, position: string, day: string): Date => {
  let month = date.getMonth();
  let year = date.getFullYear();
  
  // Find the first occurrence of the day in the month
  const dayIndex = getDayOfWeekIndex(day);
  if (dayIndex === -1) {
    throw new Error(`Invalid day: ${day}`);
  }
  
  // Create a date for the 1st of the month
  let firstDay = new Date(year, month, 1);
  
  // Find the first occurrence of the day
  let dayOccurrence = getNextDayOfWeek(firstDay, dayIndex);
  if (dayOccurrence.getMonth() !== month) {
    throw new Error('Could not find day in month');
  }
  
  // Determine which occurrence to use
  if (position === 'first') {
    // Already calculated
  } else if (position === 'second') {
    dayOccurrence.setDate(dayOccurrence.getDate() + 7);
  } else if (position === 'third') {
    dayOccurrence.setDate(dayOccurrence.getDate() + 14);
  } else if (position === 'fourth') {
    dayOccurrence.setDate(dayOccurrence.getDate() + 21);
  } else if (position === 'last') {
    // Find the last occurrence by starting from the end of the month
    const lastDay = new Date(year, month + 1, 0);
    dayOccurrence = new Date(lastDay);
    while (dayOccurrence.getDay() !== dayIndex) {
      dayOccurrence.setDate(dayOccurrence.getDate() - 1);
    }
  } else {
    throw new Error(`Invalid position: ${position}`);
  }
  
  // If the calculated date is before the reference date, move to next month
  if (isBefore(dayOccurrence, date)) {
    return getNextMonthlyOccurrence(
      new Date(date.getFullYear(), date.getMonth() + 1, 1),
      position,
      day
    );
  }
  
  return dayOccurrence;
};

/**
 * Standardized function to get the next occurrence date for any frequency
 */
export const getNextOccurrence = (
  date: Date,
  frequency: string,
  preferredDay: string
): Date => {
  const resultDate = new Date(date);
  
  // Normalize frequency
  const normalizedFrequency = frequency.toLowerCase();
  
  // For weekly frequencies
  if (normalizedFrequency === 'weekly' || normalizedFrequency === 'bi-weekly' || normalizedFrequency === 'biweekly') {
    const dayIndex = getDayOfWeekIndex(preferredDay);
    if (dayIndex === -1) {
      throw new Error(`Invalid day of week: ${preferredDay}`);
    }
    
    // Get days until next occurrence
    const currentDay = resultDate.getDay();
    const daysToAdd = (7 + dayIndex - currentDay) % 7;
    
    // For bi-weekly, ensure we're on the correct week
    if (normalizedFrequency !== 'weekly') {
      const weekDiff = Math.floor(daysToAdd / 7);
      if (weekDiff % 2 !== 0) {
        resultDate.setDate(resultDate.getDate() + 7); // Skip to next week
      }
    }
    
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate;
  }
  
  // For monthly frequencies
  if (normalizedFrequency === 'monthly') {
    // Check if preferredDay is a pattern (e.g., "first monday")
    if (preferredDay.includes(' ')) {
      const [position, day] = preferredDay.toLowerCase().split(' ');
      return getNextMonthlyOccurrence(date, position, day);
    }
    
    // Handle numeric day of month
    const dayOfMonth = parseInt(preferredDay);
    if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      throw new Error(`Invalid day of month: ${preferredDay}`);
    }
    
    return getNextDayOfMonth(date, dayOfMonth);
  }
  
  throw new Error(`Unsupported frequency: ${frequency}`);
};

/**
 * Calculate the next X occurrences of a recurring order with improved date handling
 */
export const calculateNextOccurrences = (
  startDate: Date,
  frequency: string,
  preferredDay: string,
  count: number
): Date[] => {
  console.log(`Calculating next ${count} occurrences of ${frequency} on ${preferredDay} starting from ${startDate.toISOString()}`);
  
  const occurrences: Date[] = [];
  const normalizedFrequency = frequency.toLowerCase();
  
  try {
    // Validate inputs
    if (!startDate || !frequency || !preferredDay || count < 1) {
      console.error('Invalid inputs for calculateNextOccurrences');
      return [];
    }
    
    // Make sure we're working with the start of the day
    let currentDate = startOfDay(new Date(startDate));
    
    // Get the first occurrence
    let nextDate = getNextOccurrence(currentDate, frequency, preferredDay);
    
    // If the first occurrence is before the start date, get the next one
    if (isBefore(nextDate, currentDate)) {
      if (normalizedFrequency === 'weekly' || normalizedFrequency === 'bi-weekly' || normalizedFrequency === 'biweekly') {
        nextDate = addWeeks(nextDate, normalizedFrequency === 'weekly' ? 1 : 2);
      } else if (normalizedFrequency === 'monthly') {
        nextDate = addMonths(nextDate, 1);
      }
    }
    
    // Add the first occurrence if it's valid
    if (!isBefore(nextDate, currentDate)) {
      occurrences.push(nextDate);
    }
    
    // Calculate remaining occurrences
    while (occurrences.length < count) {
      if (normalizedFrequency === 'weekly' || normalizedFrequency === 'bi-weekly' || normalizedFrequency === 'biweekly') {
        nextDate = addWeeks(nextDate, normalizedFrequency === 'weekly' ? 1 : 2);
      } else if (normalizedFrequency === 'monthly') {
        nextDate = getNextOccurrence(addMonths(nextDate, 1), frequency, preferredDay);
      }
      
      occurrences.push(nextDate);
    }
    
    console.log(`Generated ${occurrences.length} occurrences`);
    return occurrences;
  } catch (error) {
    console.error('Error calculating occurrences:', error);
    return [];
  }
};

/**
 * Check if a specific date has any recurring orders
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
      console.log("No active recurring orders found");
      return false;
    }
    
    console.log(`Checking ${recurringOrders.length} recurring orders for date ${date.toISOString()}`);
    
    // Check if any recurring order matches this date
    for (const order of recurringOrders) {
      if (!order.preferred_day) {
        console.warn(`Order ${order.id} missing preferred_day`);
        continue;
      }
      
      console.log(`Checking order ${order.id} (${order.frequency} on ${order.preferred_day})`);
      
      const occurrences = calculateNextOccurrences(
        new Date(), // Start from today
        order.frequency,
        order.preferred_day,
        5 // Look ahead a few occurrences
      );
      
      if (occurrences.length === 0) {
        console.warn(`No occurrences calculated for order ${order.id}`);
        continue;
      }
      
      // Fixed: Now properly checking each occurrence individually
      for (const occurrence of occurrences) {
        console.log(`Comparing ${occurrence.toISOString()} with ${date.toISOString()}`);
        if (isSameDay(occurrence, date)) {
          console.log(`Match found for date ${date.toISOString()}`);
          return true;
        }
      }
    }
    
    console.log(`No matching recurring orders for date ${date.toISOString()}`);
    return false;
  } catch (error) {
    console.error('Error checking recurring orders for date:', error);
    return false;
  }
};
