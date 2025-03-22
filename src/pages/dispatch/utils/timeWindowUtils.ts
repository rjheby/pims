
export interface TimeWindow {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
  label?: string;
}

export interface DeliveryTimeWindow extends TimeWindow {
  stop_id: string;
  customer_id: string;
  customer_name: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Checks if two time windows overlap
 */
export function doTimeWindowsOverlap(window1: TimeWindow, window2: TimeWindow): boolean {
  // Convert times to comparable format (minutes since midnight)
  const start1 = timeToMinutes(window1.start);
  const end1 = timeToMinutes(window1.end);
  const start2 = timeToMinutes(window2.start);
  const end2 = timeToMinutes(window2.end);
  
  // Check for overlap
  return (start1 < end2 && start2 < end1);
}

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Find conflicts among time windows
 * Returns array of pairs of conflicting time window IDs
 */
export function findTimeWindowConflicts(
  timeWindows: DeliveryTimeWindow[]
): [string, string][] {
  const conflicts: [string, string][] = [];
  
  // Compare each time window with every other
  for (let i = 0; i < timeWindows.length; i++) {
    for (let j = i + 1; j < timeWindows.length; j++) {
      if (doTimeWindowsOverlap(timeWindows[i], timeWindows[j])) {
        conflicts.push([timeWindows[i].stop_id, timeWindows[j].stop_id]);
      }
    }
  }
  
  return conflicts;
}

/**
 * Check if a new stop can be accommodated in the schedule
 * based on travel time and existing time windows
 */
export function canAccommodateStop(
  newStopWindow: TimeWindow,
  existingWindows: TimeWindow[],
  travelTimeMinutes: number
): boolean {
  // If there are no existing windows, the new stop can be accommodated
  if (existingWindows.length === 0) return true;
  
  // Sort existing windows by start time
  const sortedWindows = [...existingWindows].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
  );
  
  // Check if new stop fits before the first window
  const firstWindowStart = timeToMinutes(sortedWindows[0].start);
  const newStopEnd = timeToMinutes(newStopWindow.end) + travelTimeMinutes;
  if (newStopEnd <= firstWindowStart) return true;
  
  // Check if new stop fits after the last window
  const lastWindowEnd = timeToMinutes(sortedWindows[sortedWindows.length - 1].end);
  const newStopStart = timeToMinutes(newStopWindow.start) - travelTimeMinutes;
  if (newStopStart >= lastWindowEnd) return true;
  
  // Check if new stop fits between any two existing windows
  for (let i = 0; i < sortedWindows.length - 1; i++) {
    const currentWindowEnd = timeToMinutes(sortedWindows[i].end);
    const nextWindowStart = timeToMinutes(sortedWindows[i + 1].start);
    
    // Calculate required time: service time + travel time before and after
    const requiredTime = 
      (timeToMinutes(newStopWindow.end) - timeToMinutes(newStopWindow.start)) +
      travelTimeMinutes * 2; // Travel time to and from the stop
    
    // Check if gap is large enough
    const availableGap = nextWindowStart - currentWindowEnd;
    if (availableGap >= requiredTime) return true;
  }
  
  // If we get here, the new stop doesn't fit anywhere
  return false;
}

/**
 * Suggests optimal time for a delivery based on existing schedule
 */
export function suggestDeliveryTime(
  existingWindows: TimeWindow[],
  deliveryDurationMinutes: number,
  earliestTime: string = "08:00",
  latestTime: string = "17:00"
): TimeWindow | null {
  // Sort existing windows by start time
  const sortedWindows = [...existingWindows].sort(
    (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
  );
  
  // Default work hours boundaries
  const workDayStart = timeToMinutes(earliestTime);
  const workDayEnd = timeToMinutes(latestTime);
  
  // Find all available gaps
  const availableGaps: {start: number, end: number}[] = [];
  
  // Gap before first appointment
  if (sortedWindows.length > 0) {
    const firstStart = timeToMinutes(sortedWindows[0].start);
    if (firstStart > workDayStart) {
      availableGaps.push({
        start: workDayStart,
        end: firstStart
      });
    }
  } else {
    // No existing windows, entire day is available
    availableGaps.push({
      start: workDayStart,
      end: workDayEnd
    });
    
    // Return the middle of the day if nothing else exists
    const midPoint = Math.floor((workDayStart + workDayEnd) / 2);
    const halfDuration = Math.floor(deliveryDurationMinutes / 2);
    return {
      start: minutesToTime(midPoint - halfDuration),
      end: minutesToTime(midPoint + halfDuration)
    };
  }
  
  // Gaps between appointments
  for (let i = 0; i < sortedWindows.length - 1; i++) {
    const currentEnd = timeToMinutes(sortedWindows[i].end);
    const nextStart = timeToMinutes(sortedWindows[i + 1].start);
    
    if (nextStart - currentEnd >= deliveryDurationMinutes) {
      availableGaps.push({
        start: currentEnd,
        end: nextStart
      });
    }
  }
  
  // Gap after last appointment
  if (sortedWindows.length > 0) {
    const lastEnd = timeToMinutes(sortedWindows[sortedWindows.length - 1].end);
    if (workDayEnd - lastEnd >= deliveryDurationMinutes) {
      availableGaps.push({
        start: lastEnd,
        end: workDayEnd
      });
    }
  }
  
  // Find the best gap (prefer middle of the day)
  const midDay = workDayStart + (workDayEnd - workDayStart) / 2;
  let bestGap = null;
  let bestDistance = Infinity;
  
  for (const gap of availableGaps) {
    // Skip gaps that are too small
    if (gap.end - gap.start < deliveryDurationMinutes) continue;
    
    // Compute the midpoint of a potential delivery in this gap
    const potentialStart = gap.start;
    const potentialMid = potentialStart + deliveryDurationMinutes / 2;
    
    // Calculate distance to mid-day (prefer times closer to middle of day)
    const distance = Math.abs(potentialMid - midDay);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestGap = gap;
    }
  }
  
  // If a suitable gap was found, return a suggested time window
  if (bestGap) {
    return {
      start: minutesToTime(bestGap.start),
      end: minutesToTime(bestGap.start + deliveryDurationMinutes)
    };
  }
  
  // No suitable gap found
  return null;
}
