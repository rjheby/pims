
import { TimeWindow } from '../context/types';
import { format, parse, isAfter, isBefore, isEqual, isValid } from 'date-fns';

// Parse a preferred time string into a time window
export const parsePreferredTimeToWindow = (preferredTime?: string | null): TimeWindow => {
  // Default window is all day
  const defaultWindow: TimeWindow = {
    start: '08:00',
    end: '18:00',
    label: 'Any time'
  };
  
  if (!preferredTime) return defaultWindow;
  
  try {
    // If it already follows format "00:00-00:00"
    if (preferredTime.includes('-')) {
      const [start, end] = preferredTime.split('-');
      return {
        start: start.trim(),
        end: end.trim(),
        label: `${start.trim()} - ${end.trim()}`
      };
    }
    
    // Handle common time ranges
    if (preferredTime.toLowerCase() === 'morning') {
      return {
        start: '08:00',
        end: '12:00',
        label: 'Morning (8AM - 12PM)'
      };
    }
    
    if (preferredTime.toLowerCase() === 'afternoon') {
      return {
        start: '12:00',
        end: '17:00',
        label: 'Afternoon (12PM - 5PM)'
      };
    }
    
    if (preferredTime.toLowerCase() === 'evening') {
      return {
        start: '17:00',
        end: '20:00',
        label: 'Evening (5PM - 8PM)'
      };
    }
    
    // Return the default for any other value
    return {
      start: '08:00',
      end: '18:00',
      label: preferredTime
    };
  } catch (error) {
    console.error("Error parsing time window:", error);
    return defaultWindow;
  }
};

// Format a time window into a human-readable string
export const formatTimeWindow = (timeWindow: TimeWindow): string => {
  try {
    if (!timeWindow || !timeWindow.start || !timeWindow.end) {
      return 'Any time';
    }
    
    // If there's a label, use it
    if (timeWindow.label && timeWindow.label !== 'Any time') {
      return timeWindow.label;
    }
    
    // Format 24h times to 12h format
    const formatTime = (time: string): string => {
      try {
        const [hours, minutes] = time.split(':').map(Number);
        const isPM = hours >= 12;
        const hours12 = hours % 12 || 12;
        return `${hours12}${minutes === 0 ? '' : `:${minutes.toString().padStart(2, '0')}`}${isPM ? 'PM' : 'AM'}`;
      } catch (error) {
        return time;
      }
    };
    
    return `${formatTime(timeWindow.start)} - ${formatTime(timeWindow.end)}`;
  } catch (error) {
    console.error("Error formatting time window:", error);
    return 'Any time';
  }
};

// Helper to check if a date falls on a specific day of the week
export const isDateOnDay = (date: Date, dayName: string): boolean => {
  try {
    const dateDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return dateDay === dayName.toLowerCase();
  } catch (error) {
    console.error("Error in isDateOnDay:", error);
    return false;
  }
};

// Get the next date for a specific day of the week
export const getNextSpecificDay = (date: Date, dayName: string): Date => {
  try {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = days.indexOf(dayName.toLowerCase());
    
    if (dayIndex === -1) {
      throw new Error(`Invalid day name: ${dayName}`);
    }
    
    const result = new Date(date);
    result.setDate(result.getDate() + (7 + dayIndex - date.getDay()) % 7);
    return result;
  } catch (error) {
    console.error("Error in getNextSpecificDay:", error);
    return new Date();
  }
};

// Calculate dates for recurring orders
export const calculateRecurringDates = (
  frequency: string, 
  preferredDay: string, 
  startDate: Date, 
  endDate: Date
): Date[] => {
  try {
    console.log(`Calculating recurring dates for ${frequency} on ${preferredDay} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Get the day index (0 = Sunday, 1 = Monday, etc.)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const preferredDayIndex = days.indexOf(preferredDay.toLowerCase());
    
    if (preferredDayIndex === -1) {
      console.error(`Invalid day name: ${preferredDay}`);
      return [];
    }
    
    // Find the first occurrence of the preferred day
    const firstDay = new Date(currentDate);
    while (firstDay.getDay() !== preferredDayIndex) {
      firstDay.setDate(firstDay.getDate() + 1);
    }
    
    // Add the first day if it's within the range
    if (firstDay >= startDate && firstDay <= endDate) {
      dates.push(new Date(firstDay));
    }
    
    // Calculate next dates based on frequency
    let interval = 7; // Default interval for weekly
    
    if (frequency.toLowerCase() === 'bi-weekly' || frequency.toLowerCase() === 'biweekly') {
      interval = 14;
    }
    
    // For monthly, we need a different approach
    if (frequency.toLowerCase() === 'monthly') {
      const current = new Date(firstDay);
      
      while (current <= endDate) {
        if (current >= startDate) {
          dates.push(new Date(current));
        }
        
        // Move to the next month
        current.setMonth(current.getMonth() + 1);
        
        // Find the same day (e.g., the second Tuesday) in the next month
        // This is a simplified approach - for more complex rules (like "last Tuesday"), more logic would be needed
        while (current.getDay() !== preferredDayIndex) {
          current.setDate(current.getDate() + 1);
        }
      }
    } else {
      // For weekly and bi-weekly
      const current = new Date(firstDay);
      
      while (current <= endDate) {
        if (current >= startDate) {
          dates.push(new Date(current));
        }
        
        current.setDate(current.getDate() + interval);
      }
    }
    
    console.log(`Generated ${dates.length} dates for ${frequency} schedule on ${preferredDay}`);
    return dates;
  } catch (error) {
    console.error("Error calculating recurring dates:", error);
    return [];
  }
};

// Get future recurring dates (looking ahead a specific number of days)
export const getFutureRecurringDates = (
  frequency: string, 
  preferredDay: string, 
  daysAhead: number = 30
): Date[] => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAhead);
  
  return calculateRecurringDates(frequency, preferredDay, startDate, endDate);
};
