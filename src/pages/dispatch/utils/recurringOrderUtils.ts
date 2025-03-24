import { supabase } from "@/integrations/supabase/client";
import { addWeeks, addMonths, format, parse, isAfter, isBefore, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";

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

/**
 * Convert a day name to its index (0 = Sunday, 1 = Monday, etc.)
 */
const getDayOfWeekIndex = (day: string): number => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days.indexOf(day);
};

/**
 * Get the next occurrence of a specific day of week
 */
const getNextDayOfWeek = (date: Date, dayOfWeek: number): Date => {
  const resultDate = new Date(date);
  resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
  return resultDate;
};

/**
 * Get the next occurrence of a specific day of month
 */
const getNextDayOfMonth = (date: Date, dayOfMonth: number): Date => {
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
const getNextMonthlyOccurrence = (date: Date, position: string, day: string): Date => {
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
 * Create a recurring order from a dispatch schedule
 */
export const createRecurringOrderFromSchedule = async (
  scheduleId: string,
  frequency: string,
  preferredDay: string,
  preferredTime: string | null
): Promise<{ success: boolean; error?: string; recurringOrderId?: string }> => {
  try {
    // Fetch the schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();
      
    if (scheduleError) throw scheduleError;
    
    // Fetch all stops associated with this schedule
    const { data: stops, error: stopsError } = await supabase
      .from('delivery_stops')
      .select('*')
      .eq('master_schedule_id', scheduleId);
      
    if (stopsError) throw stopsError;
    
    if (!stops || stops.length === 0) {
      return { 
        success: false, 
        error: 'No stops found for this schedule' 
      };
    }
    
    // Group stops by customer
    const stopsByCustomer = stops.reduce((acc: Record<string, any[]>, stop) => {
      const customerId = stop.customer_id;
      if (!customerId) return acc;
      
      if (!acc[customerId]) {
        acc[customerId] = [];
      }
      
      acc[customerId].push(stop);
      return acc;
    }, {});
    
    // For each customer, create a recurring order
    const results: Array<{ customerId: string; recurringOrderId: string }> = [];
    
    for (const customerId in stopsByCustomer) {
      // Create the recurring order
      const { data: recurringOrder, error: createError } = await supabase
        .from('recurring_orders')
        .insert({
          customer_id: customerId,
          frequency,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
          active_status: true
        })
        .select()
        .single();
        
      if (createError) throw createError;
      
      if (recurringOrder) {
        results.push({
          customerId,
          recurringOrderId: recurringOrder.id
        });
      }
    }
    
    if (results.length === 0) {
      return {
        success: false,
        error: 'Failed to create recurring orders'
      };
    }
    
    return {
      success: true,
      recurringOrderId: results[0].recurringOrderId
    };
  } catch (error: any) {
    console.error('Error creating recurring order:', error);
    return {
      success: false,
      error: error.message || 'An error occurred'
    };
  }
};

/**
 * Update the recurring schedule mappings
 */
export const updateRecurringSchedule = async (recurringOrderId: string): Promise<boolean> => {
  try {
    // Fetch the recurring order details
    const { data: recurringOrder, error: orderError } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('id', recurringOrderId)
      .single();
      
    if (orderError) throw orderError;
    
    if (!recurringOrder) {
      throw new Error('Recurring order not found');
    }
    
    // Calculate the next few occurrences
    const nextOccurrences = calculateNextOccurrences(
      new Date(),
      recurringOrder.frequency,
      recurringOrder.preferred_day,
      5 // Look ahead 5 occurrences
    );
    
    if (nextOccurrences.length === 0) {
      console.warn('No future occurrences calculated for recurring order');
      return false;
    }
    
    // For each occurrence, check if we need to create a dispatch schedule
    for (const occurrenceDate of nextOccurrences) {
      const dateStr = format(occurrenceDate, 'yyyy-MM-dd');
      
      // Check if a dispatch schedule already exists for this date
      const { data: existingSchedules, error: scheduleError } = await supabase
        .from('dispatch_schedules')
        .select('id')
        .eq('schedule_date', dateStr);
        
      if (scheduleError) throw scheduleError;
      
      let scheduleId: string;
      
      if (!existingSchedules || existingSchedules.length === 0) {
        // Create a new dispatch schedule for this date
        const { data: newSchedule, error: createError } = await supabase
          .from('dispatch_schedules')
          .insert({
            schedule_date: dateStr,
            status: 'draft',
            schedule_number: `SCH-${format(occurrenceDate, 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`,
            notes: `Auto-generated from recurring order ${recurringOrderId}`
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        if (!newSchedule) {
          console.error('Failed to create new schedule');
          continue;
        }
        
        scheduleId = newSchedule.id;
      } else {
        scheduleId = existingSchedules[0].id;
      }
      
      // Check if this recurring order is already linked to this schedule
      const { data: existingLinks, error: linkError } = await supabase
        .from('recurring_order_schedules')
        .select('id')
        .eq('recurring_order_id', recurringOrderId)
        .eq('schedule_id', scheduleId);
        
      if (linkError) throw linkError;
      
      if (!existingLinks || existingLinks.length === 0) {
        // Link the recurring order to this schedule
        const { error: insertError } = await supabase
          .from('recurring_order_schedules')
          .insert({
            recurring_order_id: recurringOrderId,
            schedule_id: scheduleId,
            status: 'active'
          });
          
        if (insertError) throw insertError;
      }
      
      // Create a delivery stop for this customer in the schedule if it doesn't exist
      const { data: existingStops, error: stopError } = await supabase
        .from('delivery_stops')
        .select('id')
        .eq('master_schedule_id', scheduleId)
        .eq('customer_id', recurringOrder.customer_id);
        
      if (stopError) throw stopError;
      
      if (!existingStops || existingStops.length === 0) {
        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', recurringOrder.customer_id)
          .single();
          
        if (customerError) throw customerError;
        
        if (customer) {
          // Create a delivery stop
          const { error: createStopError } = await supabase
            .from('delivery_stops')
            .insert({
              master_schedule_id: scheduleId,
              customer_id: recurringOrder.customer_id,
              customer_name: customer.name,
              customer_address: customer.address,
              customer_phone: customer.phone,
              status: 'pending',
              notes: `Auto-generated from recurring order (${recurringOrder.frequency})`
            });
            
          if (createStopError) throw createStopError;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating recurring schedule:', error);
    return false;
  }
};

/**
 * Check and update all recurring orders to ensure schedules exist for upcoming dates
 */
export const syncAllRecurringOrders = async (): Promise<{
  success: boolean;
  processed: number;
  error?: string;
}> => {
  try {
    // Fetch all active recurring orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('recurring_orders')
      .select('*')
      .eq('active_status', true);
      
    if (ordersError) throw ordersError;
    
    if (!activeOrders || activeOrders.length === 0) {
      return { success: true, processed: 0 };
    }
    
    // For each recurring order, update its schedule
    let processedCount = 0;
    
    for (const order of activeOrders) {
      const updated = await updateRecurringSchedule(order.id);
      if (updated) processedCount++;
    }
    
    return {
      success: true,
      processed: processedCount
    };
  } catch (error: any) {
    console.error('Error syncing recurring orders:', error);
    return {
      success: false,
      processed: 0,
      error: error.message || 'An error occurred'
    };
  }
};

/**
 * Get upcoming dispatch schedules for a recurring order
 */
export const getUpcomingSchedulesForRecurringOrder = async (
  recurringOrderId: string
): Promise<any[]> => {
  try {
    // Get links between recurring order and schedules
    const { data: links, error: linkError } = await supabase
      .from('recurring_order_schedules')
      .select(`
        id,
        schedule_id,
        status,
        schedule:schedule_id (
          id,
          schedule_date,
          status,
          schedule_number
        )
      `)
      .eq('recurring_order_id', recurringOrderId)
      .order('created_at', { ascending: false });
      
    if (linkError) throw linkError;
    
    if (!links || links.length === 0) {
      return [];
    }
    
    // Filter out schedules in the past
    const today = startOfDay(new Date());
    
    return links
      .filter(link => {
        if (!link.schedule || !link.schedule.schedule_date) return false;
        const scheduleDate = parse(link.schedule.schedule_date, 'yyyy-MM-dd', new Date());
        return !isBefore(scheduleDate, today);
      })
      .map(link => link.schedule);
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    return [];
  }
};

/**
 * Find all schedules (both regular and recurring) for a specific date
 */
export const findSchedulesForDate = async (date: Date): Promise<any[]> => {
  try {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // First, find regular schedules for this date
    const { data: regularSchedules, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select(`
        *,
        recurring_schedules:recurring_order_schedules(recurring_order_id)
      `)
      .eq('schedule_date', dateStr);
      
    if (scheduleError) throw scheduleError;
    
    const schedules = regularSchedules || [];
    
    // Now check for recurring orders that should occur on this date
    // but don't have a schedule created yet
    const { data: recurringOrders, error: recurringError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('active_status', true);
      
    if (recurringError) throw recurringError;
    
    if (recurringOrders && recurringOrders.length > 0) {
      // For each recurring order, check if it should occur on this date
      for (const order of recurringOrders) {
        // Calculate if this recurring order applies to the selected date
        const occurrences = calculateNextOccurrences(
          new Date(dateStr),
          order.frequency,
          order.preferred_day,
          1 // We just need to check if today is a match
        );
        
        if (occurrences.length > 0 && isSameDay(occurrences[0], date)) {
          // Check if we already have a schedule for this recurring order on this date
          const existingScheduleForRecurring = schedules.find(schedule => 
            schedule.recurring_schedules && 
            schedule.recurring_schedules.some((rs: any) => rs.recurring_order_id === order.id)
          );
          
          if (!existingScheduleForRecurring) {
            // We need to create a schedule for this recurring order
            const newSchedule = await createScheduleForRecurringOrder(order, dateStr);
            if (newSchedule) {
              schedules.push(newSchedule);
            }
          }
        }
      }
    }
    
    return schedules;
  } catch (error) {
    console.error('Error finding schedules for date:', error);
    return [];
  }
};

/**
 * Create a schedule for a recurring order on a specific date
 */
const createScheduleForRecurringOrder = async (recurringOrder: any, dateStr: string): Promise<any | null> => {
  try {
    // Create a new schedule
    const scheduleNumber = `SCH-${dateStr.replace(/-/g, '')}-REC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const { data: newSchedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .insert({
        schedule_date: dateStr,
        status: 'draft',
        schedule_number: scheduleNumber,
        notes: `Auto-generated from recurring order for ${recurringOrder.customer?.name || 'unknown customer'}`
      })
      .select()
      .single();
      
    if (scheduleError) throw scheduleError;
    
    if (!newSchedule) {
      throw new Error('Failed to create new schedule');
    }
    
    // Link the recurring order to this schedule
    const { error: linkError } = await supabase
      .from('recurring_order_schedules')
      .insert({
        recurring_order_id: recurringOrder.id,
        schedule_id: newSchedule.id,
        status: 'active'
      });
      
    if (linkError) throw linkError;
    
    // Create a delivery stop for this customer in the schedule
    if (recurringOrder.customer) {
      const { error: stopError } = await supabase
        .from('delivery_stops')
        .insert({
          master_schedule_id: newSchedule.id,
          customer_id: recurringOrder.customer.id,
          customer_name: recurringOrder.customer.name,
          customer_address: recurringOrder.customer.address || '',
          customer_phone: recurringOrder.customer.phone || '',
          status: 'pending',
          notes: `Auto-generated from recurring order (${recurringOrder.frequency})`
        });
        
      if (stopError) throw stopError;
    }
    
    // Add recurring_schedules property to match the format expected by the component
    newSchedule.recurring_schedules = [{
      recurring_order_id: recurringOrder.id
    }];
    
    return newSchedule;
  } catch (error) {
    console.error('Error creating schedule for recurring order:', error);
    return null;
  }
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
      return false;
    }
    
    // Check if any recurring order matches this date
    for (const order of recurringOrders) {
      const occurrences = calculateNextOccurrences(
        new Date(),
        order.frequency,
        order.preferred_day,
        5 // Look ahead a few occurrences
      );
      
      // Fixed: Now properly checking each occurrence individually
      for (const occurrence of occurrences) {
        if (isSameDay(occurrence, date)) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking recurring orders for date:', error);
    return false;
  }
};
