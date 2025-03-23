
// Time window utility functions for delivery scheduling

type TimeWindow = {
  start: string; // Format: HH:MM in 24-hour format
  end: string;   // Format: HH:MM in 24-hour format
};

/**
 * Checks if a time string is in a valid HH:MM format
 */
export const isValidTimeFormat = (time: string): boolean => {
  // Check if time matches HH:MM format (24-hour)
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
};

/**
 * Converts time from string (HH:MM) to minutes from midnight
 */
export const convertTimeToMinutes = (time: string): number => {
  if (!isValidTimeFormat(time)) {
    console.error(`Invalid time format: ${time}, expected HH:MM`);
    return 0;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts minutes from midnight back to HH:MM format
 */
export const convertMinutesToTime = (minutes: number): string => {
  if (minutes < 0 || minutes > 1439) {
    console.error(`Invalid minutes value: ${minutes}, must be between 0 and 1439`);
    return "00:00";
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Checks if two time windows overlap
 */
export const doTimeWindowsOverlap = (window1: TimeWindow, window2: TimeWindow): boolean => {
  const start1 = convertTimeToMinutes(window1.start);
  const end1 = convertTimeToMinutes(window1.end);
  const start2 = convertTimeToMinutes(window2.start);
  const end2 = convertTimeToMinutes(window2.end);
  
  // Check if one window starts before the other ends
  return start1 < end2 && start2 < end1;
};

/**
 * Formats a TimeWindow object into a human-readable string
 */
export const formatTimeWindow = (window: TimeWindow): string => {
  if (!isValidTimeFormat(window.start) || !isValidTimeFormat(window.end)) {
    return "Invalid time window";
  }
  
  return `${formatTimeWithMeridian(window.start)} - ${formatTimeWithMeridian(window.end)}`;
};

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 */
export const formatTimeWithMeridian = (time: string): string => {
  if (!isValidTimeFormat(time)) {
    return time;
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Checks if a timeWindow is within business hours (default: 8:00 AM to 6:00 PM)
 */
export const isWithinBusinessHours = (
  window: TimeWindow,
  businessStart: string = "08:00",
  businessEnd: string = "18:00"
): boolean => {
  const windowStartMinutes = convertTimeToMinutes(window.start);
  const windowEndMinutes = convertTimeToMinutes(window.end);
  const businessStartMinutes = convertTimeToMinutes(businessStart);
  const businessEndMinutes = convertTimeToMinutes(businessEnd);
  
  return windowStartMinutes >= businessStartMinutes && windowEndMinutes <= businessEndMinutes;
};

/**
 * Validates a time window for basic logical consistency
 */
export const isValidTimeWindow = (window: TimeWindow): boolean => {
  if (!isValidTimeFormat(window.start) || !isValidTimeFormat(window.end)) {
    return false;
  }
  
  const startMinutes = convertTimeToMinutes(window.start);
  const endMinutes = convertTimeToMinutes(window.end);
  
  // End time must be after start time
  return endMinutes > startMinutes;
};

/**
 * Generates time slot options at 30-minute intervals
 */
export const generateTimeOptions = (
  startHour: number = 8,
  endHour: number = 18,
  intervalMinutes: number = 30
): string[] => {
  const options: string[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += intervalMinutes) {
    options.push(convertMinutesToTime(minutes));
  }
  
  return options;
};

/**
 * Converts a text-based time period (morning, afternoon, evening) to a TimeWindow
 * Used for recurring orders with preferred time periods
 */
export const timeOfDayToWindow = (timeOfDay: string): TimeWindow => {
  switch (timeOfDay.toLowerCase()) {
    case 'morning':
      return { start: '08:00', end: '12:00' };
    case 'afternoon':
      return { start: '12:00', end: '16:00' };
    case 'evening':
      return { start: '16:00', end: '20:00' };
    default:
      return { start: '08:00', end: '18:00' }; // Default business hours
  }
};

/**
 * Get next occurrence of a day from a given date
 * @param dayName Full name of day (e.g., 'monday', 'tuesday')
 * @param fromDate Starting date to calculate from
 * @returns Date object of next occurrence of the specified day
 */
export const getNextDayOccurrence = (dayName: string, fromDate: Date = new Date()): Date => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.indexOf(dayName.toLowerCase());
  
  if (dayIndex === -1) {
    console.error(`Invalid day name: ${dayName}`);
    return fromDate;
  }
  
  const targetDate = new Date(fromDate);
  const currentDay = targetDate.getDay();
  
  // Calculate days until next occurrence of the target day
  let daysUntilTarget = dayIndex - currentDay;
  if (daysUntilTarget <= 0) {
    // If today is the target day or we've already passed it this week, get next week's occurrence
    daysUntilTarget += 7;
  }
  
  // Advance date by the calculated number of days
  targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  return targetDate;
};

/**
 * Calculate all occurrences of a recurring schedule within a date range
 * @param frequency 'weekly', 'biweekly', or 'monthly'
 * @param preferredDay Day of week (e.g., 'monday', 'tuesday')
 * @param startDate Beginning of date range
 * @param endDate End of date range
 * @returns Array of dates for all occurrences
 */
export const calculateRecurringDates = (
  frequency: string,
  preferredDay: string,
  startDate: Date,
  endDate: Date
): Date[] => {
  if (!preferredDay) {
    return [];
  }
  
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  
  // First, find the first occurrence of the preferred day on or after the start date
  if (preferredDay.toLowerCase() !== startDate.toLocaleDateString('en-US', { weekday: 'lowercase' })) {
    currentDate = getNextDayOccurrence(preferredDay, startDate);
  }
  
  // Continue adding occurrences until we've passed the end date
  while (currentDate <= endDate) {
    occurrences.push(new Date(currentDate));
    
    // Calculate next occurrence based on frequency
    switch (frequency.toLowerCase()) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        // Move forward one month, then find the next occurrence of the preferred day
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate = getNextDayOccurrence(preferredDay, currentDate);
        break;
      default:
        currentDate.setDate(currentDate.getDate() + 7); // Default to weekly
    }
  }
  
  return occurrences;
};

/**
 * Parse a preferred time string from the recurring orders table to a TimeWindow
 */
export const parsePreferredTimeToWindow = (preferredTime?: string): TimeWindow => {
  if (!preferredTime) {
    return { start: '08:00', end: '18:00' }; // Default to full business day
  }
  
  // Check if it's a time of day term
  if (['morning', 'afternoon', 'evening'].includes(preferredTime.toLowerCase())) {
    return timeOfDayToWindow(preferredTime);
  }
  
  // If it's a specific time window format (HH:MM-HH:MM)
  const timeWindowMatch = preferredTime.match(/^(\d\d:\d\d)-(\d\d:\d\d)$/);
  if (timeWindowMatch) {
    return {
      start: timeWindowMatch[1],
      end: timeWindowMatch[2]
    };
  }
  
  // Default to business hours if format can't be determined
  return { start: '08:00', end: '18:00' };
};

/**
 * Formats a recurring order frequency for display
 */
export const formatRecurringFrequency = (frequency: string): string => {
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return 'Every week';
    case 'biweekly':
      return 'Every two weeks';
    case 'monthly':
      return 'Every month';
    default:
      return frequency;
  }
};

/**
 * Formats a preferred day for display
 */
export const formatPreferredDay = (day?: string): string => {
  if (!day) return 'Any day';
  
  // Capitalize first letter
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

/**
 * Get color for a specific time slot based on the window
 */
export const getTimeSlotColor = (timeWindow: TimeWindow): string => {
  const start = convertTimeToMinutes(timeWindow.start);
  
  // Different color palettes based on time of day
  if (start < 720) { // Morning (before noon)
    return 'bg-blue-50 border-blue-200 text-blue-700';
  } else if (start < 960) { // Afternoon (before 4pm)
    return 'bg-amber-50 border-amber-200 text-amber-700';
  } else { // Evening
    return 'bg-purple-50 border-purple-200 text-purple-700';
  }
};
