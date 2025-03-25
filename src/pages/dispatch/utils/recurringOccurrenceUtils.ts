
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
 * Calculate the next X occurrences of a recurring order
 */
export const calculateNextOccurrences = (
  startDate: Date,
  frequency: string,
  preferredDay: string,
  count: number
): Date[] => {
  console.log(`Calculating next ${count} occurrences of ${frequency} on ${preferredDay} starting from ${startDate.toISOString()}`);
  
  const occurrences: Date[] = [];
  
  // Make sure we're working with the start of the day
  startDate = startOfDay(startDate);
  
  try {
    if (frequency.toLowerCase() === 'weekly' || frequency.toLowerCase() === 'bi-weekly' || frequency.toLowerCase() === 'biweekly') {
      // Parse day of week
      const dayIndex = getDayOfWeekIndex(preferredDay.toLowerCase());
      
      if (dayIndex === -1) {
        console.error('Invalid day of week:', preferredDay);
        return [];
      }
      
      console.log(`Day index for ${preferredDay} is ${dayIndex}, current day is ${startDate.getDay()}`);
      
      // Get the next occurrence of this weekday
      let currentDate = getNextDayOfWeek(startDate, dayIndex);
      console.log(`Next occurrence of ${preferredDay} after ${startDate.toISOString()} is ${currentDate.toISOString()}`);
      
      // Check if we need to add this date
      if (isEqual(startOfDay(startDate), startOfDay(currentDate)) || isAfter(currentDate, startDate)) {
        occurrences.push(currentDate);
        console.log(`Added date: ${currentDate.toISOString()}`);
      }
      
      // Calculate future occurrences
      const interval = (frequency.toLowerCase() === 'weekly') ? 1 : 2;
      console.log(`Using interval of ${interval} weeks for ${frequency}`);
      
      while (occurrences.length < count) {
        currentDate = addWeeks(currentDate, interval);
        occurrences.push(currentDate);
        console.log(`Added date: ${currentDate.toISOString()}`);
      }
    } else if (frequency.toLowerCase() === 'monthly') {
      // Check if preferredDay is a pattern like "first monday"
      if (preferredDay.includes(' ')) {
        const [position, day] = preferredDay.toLowerCase().split(' ');
        
        // Get the next occurrence based on pattern
        let currentDate = getNextMonthlyOccurrence(startDate, position, day);
        
        // Check if we need to add this date
        if (isEqual(startOfDay(startDate), startOfDay(currentDate)) || isAfter(currentDate, startDate)) {
          occurrences.push(currentDate);
        }
        
        // Calculate future occurrences
        while (occurrences.length < count) {
          currentDate = getNextMonthlyOccurrence(addMonths(currentDate, 1), position, day);
          occurrences.push(currentDate);
        }
      } else {
        // Assuming preferredDay is a number (day of month)
        const dayOfMonth = parseInt(preferredDay);
        
        if (isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
          console.error('Invalid day of month:', preferredDay);
          return [];
        }
        
        // Get the next occurrence of this day of month
        let currentDate = getNextDayOfMonth(startDate, dayOfMonth);
        
        // Check if we need to add this date
        if (isEqual(startOfDay(startDate), startOfDay(currentDate)) || isAfter(currentDate, startDate)) {
          occurrences.push(currentDate);
        }
        
        // Calculate future occurrences
        while (occurrences.length < count) {
          currentDate = getNextDayOfMonth(addMonths(currentDate, 1), dayOfMonth);
          occurrences.push(currentDate);
        }
      }
    }
  } catch (error) {
    console.error('Error calculating occurrences:', error);
  }
  
  console.log(`Calculated ${occurrences.length} occurrences`);
  return occurrences;
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
