import { addWeeks, addMonths, format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";

/**
 * Convert a day name to its index (0 = Sunday, 1 = Monday, etc.)
 */
export const getDayOfWeekIndex = (day: string): number => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(day);
};

/**
 * Get the next occurrence of a specific day of week
 */
export const getNextDayOfWeek = (date: Date, dayOfWeek: number): Date => {
  const resultDate = new Date(date);
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
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
  const occurrences: Date[] = [];
  
  // Make sure we're working with the start of the day
  startDate = startOfDay(startDate);
  
  try {
    if (frequency === 'weekly' || frequency === 'bi-weekly') {
      // Parse day of week
      const dayIndex = getDayOfWeekIndex(preferredDay.toLowerCase());
      
      if (dayIndex === -1) {
        console.error('Invalid day of week:', preferredDay);
        return [];
      }
      
      // Get the next occurrence of this weekday
      let currentDate = getNextDayOfWeek(startDate, dayIndex);
      
      // Check if we need to add this date
      if (isEqual(startDate, currentDate) || isAfter(currentDate, startDate)) {
        occurrences.push(currentDate);
      }
      
      // Calculate future occurrences
      const interval = frequency === 'weekly' ? 1 : 2;
      
      while (occurrences.length < count) {
        currentDate = addWeeks(currentDate, interval);
        occurrences.push(currentDate);
      }
    } else if (frequency === 'monthly') {
      // Check if preferredDay is a pattern like "first monday"
      if (preferredDay.includes(' ')) {
        const [position, day] = preferredDay.toLowerCase().split(' ');
        
        // Get the next occurrence based on pattern
        let currentDate = getNextMonthlyOccurrence(startDate, position, day);
        
        // Check if we need to add this date
        if (isEqual(startDate, currentDate) || isAfter(currentDate, startDate)) {
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
        if (isEqual(startDate, currentDate) || isAfter(currentDate, startDate)) {
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
  
  return occurrences;
};
