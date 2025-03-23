
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
