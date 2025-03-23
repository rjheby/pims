
import { format, addDays, addWeeks, addMonths, parse, isAfter, isBefore, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day: string;
  preferred_time: string | null;
  active_status: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
}

export interface RecurringSchedule {
  id: string;
  recurring_order_id: string;
  schedule_id: string;
  status: string;
  modified_from_template: boolean;
  created_at: string;
  updated_at: string;
  recurring_order?: RecurringOrder;
  schedule?: {
    id: string;
    schedule_date: string;
    schedule_number: string;
    status: string;
  };
}

// Helper to get the next occurrence date based on frequency and preferred day
export const getNextOccurrence = (
  startDate: Date,
  frequency: string,
  preferredDay: string
): Date | null => {
  try {
    if (!preferredDay) {
      console.warn('No preferred day specified for recurring order');
      return null;
    }

    let nextDate = new Date(startDate);
    
    // Reset time to midnight
    nextDate.setHours(0, 0, 0, 0);
    
    // Handle different frequencies
    switch (frequency.toLowerCase()) {
      case 'weekly': {
        // Preferred day should be day of week (0-6, where 0 is Sunday)
        const targetDay = getDayNumber(preferredDay);
        if (targetDay === -1) return null;
        
        // Calculate days to add to reach the target day
        const currentDay = nextDate.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Move to next week if the day has already passed
        
        return addDays(nextDate, daysToAdd);
      }
      
      case 'bi-weekly': {
        // First get the next weekly occurrence
        const targetDay = getDayNumber(preferredDay);
        if (targetDay === -1) return null;
        
        // Calculate days to add to reach the target day
        const currentDay = nextDate.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        
        // Get next weekly occurrence
        const nextWeeklyDate = addDays(nextDate, daysToAdd);
        
        // For bi-weekly, add another week if it's an odd-numbered week from the start date
        // This logic assumes we want to schedule on even-numbered weeks from the start
        const weeksBetween = Math.round(
          (nextWeeklyDate.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        
        return weeksBetween % 2 === 0 ? nextWeeklyDate : addWeeks(nextWeeklyDate, 1);
      }
      
      case 'monthly': {
        // Preferred day could be a day of month (1-31) or a pattern like "first monday"
        if (/^\d+$/.test(preferredDay)) {
          // Numeric day of month
          const targetDay = parseInt(preferredDay, 10);
          let result = new Date(nextDate);
          
          // Move to the next month if the day has passed this month
          if (nextDate.getDate() > targetDay) {
            result = addMonths(result, 1);
          }
          
          result.setDate(targetDay);
          return result;
        } else {
          // Pattern like "first monday"
          const parts = preferredDay.split(' ');
          if (parts.length !== 2) return null;
          
          const ordinal = parts[0].toLowerCase();
          const day = parts[1].toLowerCase();
          
          // Convert ordinal to number (first->1, second->2, etc.)
          const ordinalMap: Record<string, number> = {
            'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'last': -1
          };
          
          const ordinalNum = ordinalMap[ordinal];
          if (ordinalNum === undefined) return null;
          
          const dayNum = getDayNumber(day);
          if (dayNum === -1) return null;
          
          // Calculate the date for the pattern in the current month
          let result = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
          
          if (ordinalNum === -1) {
            // Last X of the month
            // Go to the first day of next month and then back up to find the last occurrence
            result = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0);
            while (result.getDay() !== dayNum) {
              result = addDays(result, -1);
            }
          } else {
            // Find the first occurrence of the day in the month
            while (result.getDay() !== dayNum) {
              result = addDays(result, 1);
            }
            
            // Add weeks to get to the nth occurrence
            result = addDays(result, (ordinalNum - 1) * 7);
          }
          
          // If the calculated date is before the start date, move to next month
          if (isBefore(result, nextDate)) {
            return getNextOccurrence(addMonths(nextDate, 1), frequency, preferredDay);
          }
          
          return result;
        }
      }
      
      default:
        console.warn(`Unknown frequency: ${frequency}`);
        return null;
    }
  } catch (error) {
    console.error('Error calculating next occurrence:', error);
    return null;
  }
};

// Helper to convert day name to number
export const getDayNumber = (day: string): number => {
  const days: Record<string, number> = {
    'sunday': 0, 'sun': 0,
    'monday': 1, 'mon': 1,
    'tuesday': 2, 'tue': 2,
    'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thu': 4,
    'friday': 5, 'fri': 5,
    'saturday': 6, 'sat': 6
  };
  
  return days[day.toLowerCase()] ?? -1;
};

// Function to calculate the next N occurrences of a recurring order
export const calculateNextOccurrences = (
  startDate: Date,
  frequency: string,
  preferredDay: string,
  count: number = 10
): Date[] => {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    const nextDate = getNextOccurrence(currentDate, frequency, preferredDay);
    if (!nextDate) break;
    
    occurrences.push(nextDate);
    currentDate = addDays(nextDate, 1); // Move past the found date to find the next one
  }
  
  return occurrences;
};

// Function to fetch all recurring orders
export const fetchRecurringOrders = async (): Promise<RecurringOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching recurring orders:', error);
    throw error;
  }
};

// Function to check if a date has recurring orders
export const checkDateForRecurringOrders = async (date: Date): Promise<{ hasRecurring: boolean, schedules: any[] }> => {
  try {
    // Format the date to YYYY-MM-DD
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // First, try to find any schedule for this date that is linked to a recurring order
    const { data: existingSchedules, error: scheduleError } = await supabase
      .from('recurring_order_schedules')
      .select(`
        *,
        schedule:schedule_id (
          id, schedule_date, schedule_number, status
        ),
        recurring_order:recurring_order_id (
          id, customer_id, frequency, preferred_day, preferred_time,
          customer:customer_id (
            id, name, address, phone
          )
        )
      `)
      .eq('schedule.schedule_date', formattedDate);
    
    if (scheduleError) {
      console.error('Error checking for existing recurring schedules:', scheduleError);
      throw scheduleError;
    }
    
    const matchingSchedules = Array.isArray(existingSchedules) ? existingSchedules : [];
    
    return { 
      hasRecurring: matchingSchedules.length > 0,
      schedules: matchingSchedules
    };
  } catch (error) {
    console.error('Error checking date for recurring orders:', error);
    return { hasRecurring: false, schedules: [] };
  }
};

// Function to create or update schedules for recurring orders
export const createSchedulesForRecurringOrders = async (
  recurringOrderId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean, schedulesCreated: number, error?: string }> => {
  try {
    // Fetch the recurring order details
    const { data: orderData, error: orderError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone
        )
      `)
      .eq('id', recurringOrderId)
      .single();
    
    if (orderError) throw orderError;
    if (!orderData) throw new Error('Recurring order not found');
    
    // Check if the order is active
    if (!orderData.active_status) {
      return { success: false, schedulesCreated: 0, error: 'Recurring order is inactive' };
    }
    
    // Calculate occurrences between start and end date
    const occurrences: Date[] = [];
    let currentDate = new Date(startDate);
    
    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      const nextDate = getNextOccurrence(currentDate, orderData.frequency, orderData.preferred_day);
      if (!nextDate) break;
      
      if (isBefore(nextDate, endDate) || isSameDay(nextDate, endDate)) {
        occurrences.push(nextDate);
      }
      
      currentDate = addDays(nextDate, 1);
    }
    
    // For each occurrence, create or update a schedule
    let schedulesCreated = 0;
    
    for (const occurrenceDate of occurrences) {
      const formattedDate = format(occurrenceDate, 'yyyy-MM-dd');
      
      // Check if a schedule already exists for this date
      const { data: existingSchedules, error: scheduleError } = await supabase
        .from('dispatch_schedules')
        .select('id, schedule_date')
        .eq('schedule_date', formattedDate);
      
      if (scheduleError) throw scheduleError;
      
      let scheduleId: string;
      
      if (existingSchedules && existingSchedules.length > 0) {
        // Use existing schedule
        scheduleId = existingSchedules[0].id;
      } else {
        // Create new schedule
        const scheduleNumber = `DS-${format(occurrenceDate, 'yyyyMMdd')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        const { data: newSchedule, error: createError } = await supabase
          .from('dispatch_schedules')
          .insert({
            schedule_date: formattedDate,
            schedule_number: scheduleNumber,
            status: 'draft'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        scheduleId = newSchedule.id;
        
        // Create a delivery stop for this schedule
        const { error: stopError } = await supabase
          .from('delivery_stops')
          .insert({
            master_schedule_id: scheduleId,
            customer_id: orderData.customer_id,
            customer_name: orderData.customer?.name || 'Unknown',
            customer_address: orderData.customer?.address || '',
            customer_phone: orderData.customer?.phone || '',
            items: 'Recurring delivery',
            notes: `Recurring ${orderData.frequency} delivery`
          });
        
        if (stopError) {
          console.error('Error creating delivery stop:', stopError);
          // Continue anyway to link the recurring order to the schedule
        }
      }
      
      // Link the recurring order to the schedule - Fix the onConflict issue
      try {
        const { error: linkError } = await supabase
          .from('recurring_order_schedules')
          .insert({
            recurring_order_id: recurringOrderId,
            schedule_id: scheduleId,
            status: 'active'
          });
        
        if (linkError) {
          console.error('Error linking recurring order to schedule:', linkError);
          continue;
        }
      } catch (error) {
        console.error('Error inserting record:', error);
        continue;
      }
      
      schedulesCreated++;
    }
    
    return { success: true, schedulesCreated };
  } catch (error: any) {
    console.error('Error creating schedules for recurring order:', error);
    return { success: false, schedulesCreated: 0, error: error.message };
  }
};

// Function to find schedules for a specific date that include recurring orders
export const findSchedulesForDate = async (date: Date): Promise<any[]> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get all schedules for this date
    const { data: schedules, error: schedulesError } = await supabase
      .from('dispatch_schedules')
      .select('*')
      .eq('schedule_date', formattedDate);
    
    if (schedulesError) throw schedulesError;
    
    if (!schedules || schedules.length === 0) {
      return [];
    }
    
    // For each schedule, check if it's linked to a recurring order
    const scheduleIds = schedules.map(s => s.id);
    
    const { data: recurringLinks, error: linksError } = await supabase
      .from('recurring_order_schedules')
      .select(`
        *,
        recurring_order:recurring_order_id (
          id, customer_id, frequency, preferred_day, preferred_time,
          customer:customer_id (
            id, name
          )
        )
      `)
      .in('schedule_id', scheduleIds);
    
    if (linksError) throw linksError;
    
    // Create a map of scheduleId -> isRecurring
    const recurringMap: Record<string, boolean> = {};
    
    if (recurringLinks) {
      for (const link of recurringLinks) {
        recurringMap[link.schedule_id] = true;
      }
    }
    
    // Annotate the schedules with isRecurring flag
    return schedules.map(schedule => ({
      ...schedule,
      isRecurring: !!recurringMap[schedule.id]
    }));
  } catch (error) {
    console.error('Error finding schedules for date:', error);
    return [];
  }
};

// Function to create a recurring order from an existing schedule
export const createRecurringOrderFromSchedule = async (
  scheduleId: string,
  frequency: string,
  preferredDay: string,
  preferredTime: string | null = null
): Promise<{ success: boolean, recurringOrderId?: string, error?: string }> => {
  try {
    // First, fetch the schedule details to get customer information
    const { data: schedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select('id, schedule_date')
      .eq('id', scheduleId)
      .single();
    
    if (scheduleError) throw scheduleError;
    if (!schedule) throw new Error('Schedule not found');
    
    // Get the delivery stops for this schedule
    const { data: stops, error: stopsError } = await supabase
      .from('delivery_stops')
      .select('customer_id, customer_name, items, notes')
      .eq('master_schedule_id', scheduleId);
    
    if (stopsError) throw stopsError;
    if (!stops || stops.length === 0) {
      return { success: false, error: 'No delivery stops found for this schedule' };
    }
    
    // Create a recurring order for each stop
    const results = [];
    
    for (const stop of stops) {
      // Create the recurring order
      const { data: recurringOrder, error: createError } = await supabase
        .from('recurring_orders')
        .insert({
          customer_id: stop.customer_id,
          frequency: frequency,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
          active_status: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating recurring order:', createError);
        continue;
      }
      
      // Link this recurring order to the current schedule
      const { error: linkError } = await supabase
        .from('recurring_order_schedules')
        .insert({
          recurring_order_id: recurringOrder.id,
          schedule_id: scheduleId,
          status: 'active',
          modified_from_template: false
        });
      
      if (linkError) {
        console.error('Error linking recurring order to schedule:', linkError);
      }
      
      results.push({
        success: true,
        recurringOrderId: recurringOrder.id
      });
    }
    
    if (results.length === 0) {
      return { success: false, error: 'Failed to create any recurring orders' };
    }
    
    return { 
      success: true, 
      recurringOrderId: results[0].recurringOrderId 
    };
  } catch (error: any) {
    console.error('Error creating recurring order from schedule:', error);
    return { success: false, error: error.message };
  }
};

// Function to update a recurring schedule
export const updateRecurringOrder = async (
  recurringOrderId: string,
  updateData: Partial<RecurringOrder>
): Promise<{ success: boolean, error?: string }> => {
  try {
    const { error } = await supabase
      .from('recurring_orders')
      .update(updateData)
      .eq('id', recurringOrderId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating recurring order:', error);
    return { success: false, error: error.message };
  }
};

// Alias function to maintain compatibility with components that may be expecting this
export const updateRecurringSchedule = updateRecurringOrder;
