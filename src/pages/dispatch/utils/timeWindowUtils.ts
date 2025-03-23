
import { format, addDays, startOfWeek, addWeeks, startOfMonth, getDate, getMonth, getYear, isAfter, isBefore, isEqual } from 'date-fns';

export interface TimeWindow {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

// Calculate recurring dates based on frequency and preferred day
export function calculateRecurringDates(
  frequency: string,
  preferredDay: string,
  startDate: Date,
  endDate: Date
): Date[] {
  console.log(`Calculating recurring dates: ${frequency}, ${preferredDay}, ${startDate.toISOString()} to ${endDate.toISOString()}`);
  const dates: Date[] = [];
  const normalizedPreferredDay = preferredDay.toLowerCase();

  // Clone dates to avoid modifying the originals
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set hours to beginning of day for consistent comparison
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  // Weekly - Find all occurrences of the preferred day between start and end
  if (frequency.toLowerCase() === 'weekly') {
    let currentDate = new Date(start);
    
    // Move to the first occurrence of preferred day on or after start date
    while (!isDateOnDay(currentDate, normalizedPreferredDay)) {
      currentDate = addDays(currentDate, 1);
      if (isAfter(currentDate, end)) return dates; // No occurrences in range
    }
    
    // Add all weekly occurrences
    while (isBefore(currentDate, end) || isEqual(currentDate, end)) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 7); // Next week
    }
  }
  // Biweekly - Similar to weekly but with 14-day intervals
  else if (frequency.toLowerCase() === 'biweekly') {
    let currentDate = new Date(start);
    
    // Move to the first occurrence of preferred day on or after start date
    while (!isDateOnDay(currentDate, normalizedPreferredDay)) {
      currentDate = addDays(currentDate, 1);
      if (isAfter(currentDate, end)) return dates; // No occurrences in range
    }
    
    // Add all biweekly occurrences
    while (isBefore(currentDate, end) || isEqual(currentDate, end)) {
      dates.push(new Date(currentDate));
      currentDate = addDays(currentDate, 14); // Every two weeks
    }
  }
  // Monthly - Find first occurrence of day in each month
  else if (frequency.toLowerCase() === 'monthly') {
    let currentMonth = getMonth(start);
    let currentYear = getYear(start);
    
    while (
      (currentYear < getYear(end)) || 
      (currentYear === getYear(end) && currentMonth <= getMonth(end))
    ) {
      // Find the first occurrence of the preferred day in this month
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
      let found = false;
      
      for (let day = 1; day <= 31; day++) {
        const date = new Date(currentYear, currentMonth, day);
        
        // Break if we've gone to next month
        if (getMonth(date) !== currentMonth) break;
        
        if (isDateOnDay(date, normalizedPreferredDay)) {
          // Only add if in range
          if ((isAfter(date, start) || isEqual(date, start)) && 
              (isBefore(date, end) || isEqual(date, end))) {
            dates.push(new Date(date));
          }
          found = true;
          break;
        }
      }
      
      // Move to next month
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
    }
  }
  
  console.log(`Found ${dates.length} recurring dates for ${preferredDay}`);
  return dates;
}

// Get future recurring dates based on a frequency and preferred day
export function getFutureRecurringDates(
  frequency: string,
  preferredDay: string,
  daysAhead: number = 30
): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = addDays(today, daysAhead);
  
  return calculateRecurringDates(
    frequency,
    preferredDay,
    today,
    futureDate
  );
}

// Check if a date falls on a specific day of the week
export function isDateOnDay(date: Date, dayName: string): boolean {
  const formattedDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return formattedDay === dayName.toLowerCase();
}

// Get the next date that falls on a specific day of the week
export function getNextSpecificDay(fromDate: Date, dayName: string): Date {
  const dayOfWeek = getDayNumber(dayName);
  const referenceDate = new Date(fromDate);
  
  let daysToAdd = dayOfWeek - referenceDate.getDay();
  if (daysToAdd <= 0) daysToAdd += 7; // If today or earlier in the week, get next week
  
  return addDays(referenceDate, daysToAdd);
}

// Helper to convert day name to number (0 = Sunday, 1 = Monday, etc.)
function getDayNumber(dayName: string): number {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(dayName.toLowerCase());
}

// Parse preferred time string into a TimeWindow object
export function parsePreferredTimeToWindow(preferredTime?: string): TimeWindow {
  if (!preferredTime) {
    return { start: '09:00', end: '17:00' }; // Default to business hours
  }
  
  // Check if it's already a range (contains a hyphen)
  if (preferredTime.includes('-')) {
    const [start, end] = preferredTime.split('-').map(t => t.trim());
    return { start, end };
  }
  
  // If it's a single time, create a 2-hour window
  const timeParts = preferredTime.trim().split(':');
  const hour = parseInt(timeParts[0]);
  const minute = timeParts.length > 1 ? parseInt(timeParts[1]) : 0;
  
  // Format the start time
  const start = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  // Calculate end time (2 hours later)
  const endHour = (hour + 2) % 24;
  const end = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  return { start, end };
}

// Format a TimeWindow into a display string
export function formatTimeWindow(timeWindow: TimeWindow): string {
  const { start, end } = timeWindow;
  
  // Helper to format 24h time to 12h time with AM/PM
  const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Get date range for a recurring pattern
export function getRecurringDateRange(
  frequency: string,
  startDate: Date,
  count: number
): Date[] {
  // Clone date to avoid modifying the original
  const date = new Date(startDate);
  const dates: Date[] = [new Date(date)];
  
  // Generate dates based on frequency
  for (let i = 1; i < count; i++) {
    if (frequency.toLowerCase() === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (frequency.toLowerCase() === 'biweekly') {
      date.setDate(date.getDate() + 14);
    } else if (frequency.toLowerCase() === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    }
    
    dates.push(new Date(date));
  }
  
  return dates;
}

// Format day of week to a readable format
export function formatDayOfWeek(date: Date): string {
  return format(date, 'EEEE'); // Returns full day name, e.g. "Monday"
}

// Compare two dates to check if they fall on the same day
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Convert a date to a standardized string format (YYYY-MM-DD)
export function dateToString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
