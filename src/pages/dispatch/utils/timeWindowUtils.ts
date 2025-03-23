
/**
 * Time window utilities for parsing and formatting time windows
 */

export type TimeWindow = {
  start: string; // in 24h format
  end: string;   // in 24h format
  label: string; // human readable label
};

// Map preferred time to actual time windows
export const TIME_WINDOWS: Record<string, TimeWindow> = {
  morning: {
    start: '08:00',
    end: '12:00',
    label: 'Morning (8am-12pm)'
  },
  afternoon: {
    start: '12:00',
    end: '17:00',
    label: 'Afternoon (12pm-5pm)'
  },
  evening: {
    start: '17:00',
    end: '20:00',
    label: 'Evening (5pm-8pm)'
  },
  any: {
    start: '08:00',
    end: '20:00',
    label: 'Any time (8am-8pm)'
  }
};

/**
 * Parse a preferred time string to a TimeWindow object
 */
export const parsePreferredTimeToWindow = (preferredTime?: string): TimeWindow => {
  if (!preferredTime) return TIME_WINDOWS.any;
  
  const timeKey = preferredTime.toLowerCase().trim();
  return TIME_WINDOWS[timeKey] || TIME_WINDOWS.any;
};

/**
 * Format a TimeWindow to a readable string
 */
export const formatTimeWindow = (timeWindow: TimeWindow): string => {
  return timeWindow.label;
};

/**
 * Check if a time string is within a time window
 * @param time Time string in 24h format (HH:MM)
 * @param window TimeWindow object
 */
export const isTimeInWindow = (time: string, window: TimeWindow): boolean => {
  return time >= window.start && time <= window.end;
};

/**
 * Convert 12h time to 24h time
 * @param time12h Time string in 12h format (e.g., "2:30 PM")
 * @returns Time string in 24h format (e.g., "14:30")
 */
export const convert12hTo24h = (time12h: string): string => {
  const [timePart, meridiem] = time12h.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  } else if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Convert 24h time to 12h time
 * @param time24h Time string in 24h format (e.g., "14:30")
 * @returns Time string in 12h format (e.g., "2:30 PM")
 */
export const convert24hTo12h = (time24h: string): string => {
  const [hours, minutes] = time24h.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Check if a date falls on a specified day of the week
 * @param date The date to check
 * @param dayName Day name (e.g., "monday", "tuesday") - case insensitive
 * @returns Boolean indicating if the date falls on the specified day
 */
export const isDateOnDay = (date: Date, dayName: string): boolean => {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return dayOfWeek === dayName.toLowerCase();
};

/**
 * Get the next date that falls on a specific day of the week
 * @param startDate The starting date
 * @param dayName Day name (e.g., "monday", "tuesday") - case insensitive
 * @returns Date object representing the next occurrence of the specified day
 */
export const getNextSpecificDay = (startDate: Date, dayName: string): Date => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIndex = dayNames.findIndex(d => d === dayName.toLowerCase());
  
  if (targetDayIndex === -1) {
    throw new Error(`Invalid day name: ${dayName}`);
  }
  
  const result = new Date(startDate);
  result.setHours(0, 0, 0, 0);
  
  // Calculate days to add to reach the next occurrence of the target day
  const currentDayIndex = result.getDay();
  let daysToAdd = targetDayIndex - currentDayIndex;
  
  // If today is the target day or we've already passed it this week, go to next week
  if (daysToAdd <= 0) {
    daysToAdd += 7;
  }
  
  result.setDate(result.getDate() + daysToAdd);
  return result;
};

/**
 * Calculate recurring dates based on frequency and preferred day
 * @param frequency Recurrence frequency ("weekly", "biweekly", "monthly")
 * @param preferredDay Day of the week (e.g., "monday", "tuesday")
 * @param startDate Start date for calculation
 * @param endDate End date for calculation
 * @returns Array of dates that match the recurrence pattern
 */
export const calculateRecurringDates = (
  frequency: string,
  preferredDay: string,
  startDate: Date,
  endDate: Date
): Date[] => {
  const result: Date[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  // Ensure startDate is not after endDate
  if (currentDate > endDate) {
    return result;
  }
  
  // Find the first occurrence of the preferred day starting from startDate
  if (!isDateOnDay(currentDate, preferredDay)) {
    currentDate.setTime(getNextSpecificDay(currentDate, preferredDay).getTime());
  }
  
  // Calculate occurrences based on frequency until reaching endDate
  while (currentDate <= endDate) {
    result.push(new Date(currentDate));
    
    // Increment date based on frequency
    if (frequency.toLowerCase() === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency.toLowerCase() === 'biweekly') {
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (frequency.toLowerCase() === 'monthly') {
      // For monthly, find the next occurrence after a month
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      
      // Find the next preferred day from the new month start
      const firstDayOfNextMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      currentDate.setTime(getNextSpecificDay(firstDayOfNextMonth, preferredDay).getTime());
    } else {
      // Default to weekly if frequency is unknown
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }
  
  return result;
};

/**
 * Get future recurring dates for a specific frequency and preferred day
 * @param frequency Recurrence frequency ("weekly", "biweekly", "monthly")
 * @param preferredDay Day of the week (e.g., "monday", "tuesday")
 * @param daysAhead Number of days to look ahead
 * @returns Array of dates matching the recurring pattern
 */
export const getFutureRecurringDates = (
  frequency: string,
  preferredDay: string,
  daysAhead: number = 30
): Date[] => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + daysAhead);
  
  return calculateRecurringDates(frequency, preferredDay, startDate, endDate);
};
