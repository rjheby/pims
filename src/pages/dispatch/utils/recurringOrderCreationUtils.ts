
import { supabase } from "@/integrations/supabase/client";
import { calculateNextOccurrences } from "./recurringOccurrenceUtils";
import { format, parse, isBefore, isAfter, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";
import { consolidateRecurringOrders, findSchedulesForDateBasic } from "./scheduleUtils";

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
    
    // Group occurrences by date to avoid creating multiple schedules for the same day
    const dateMap = new Map<string, Date>();
    for (const date of nextOccurrences) {
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap.set(dateStr, date);
    }
    
    // For each unique date, find or create a schedule and add this recurring order to it
    for (const [dateStr, occurrenceDate] of dateMap.entries()) {
      // Instead of creating the schedule directly, use the consolidation function
      const scheduleInfo = await consolidateRecurringOrders(dateStr);
      
      if (!scheduleInfo) {
        console.error(`Failed to consolidate schedule for date ${dateStr}`);
        continue;
      }
      
      const scheduleId = scheduleInfo.scheduleId;
      
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
              is_recurring: true,
              recurring_id: recurringOrderId,
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
    
    // Group orders by customer first to consolidate schedules
    const ordersByCustomer: Record<string, any[]> = {};
    activeOrders.forEach(order => {
      if (!ordersByCustomer[order.customer_id]) {
        ordersByCustomer[order.customer_id] = [];
      }
      ordersByCustomer[order.customer_id].push(order);
    });
    
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
    
    // Fix TypeScript error with a more robust approach
    const upcomingSchedules = (links || [])
      .filter(link => {
        // Ensure the schedule object exists and has a schedule_date property
        if (!link || !link.schedule || typeof link.schedule !== 'object' || !('schedule_date' in link.schedule)) {
          console.warn('Invalid schedule data found:', link);
          return false;
        }
        
        try {
          const scheduleDate = parse(
            link.schedule.schedule_date as string, 
            'yyyy-MM-dd', 
            new Date()
          );
          return !isBefore(scheduleDate, today);
        } catch (error) {
          console.error('Date parsing error:', error, link.schedule);
          return false;
        }
      })
      .map(link => link.schedule);
      
    return upcomingSchedules;
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    return [];
  }
};
