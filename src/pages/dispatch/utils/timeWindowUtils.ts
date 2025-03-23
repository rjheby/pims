
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
