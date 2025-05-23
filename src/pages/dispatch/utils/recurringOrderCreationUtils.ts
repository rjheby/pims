import { supabase } from "@/integrations/supabase/client";
import { calculateNextOccurrences } from "./recurringOccurrenceUtils";
import { format, parse, isBefore, isAfter, isEqual, startOfDay, endOfDay, isSameDay } from "date-fns";
import { consolidateRecurringOrders, findSchedulesForDateBasic, createScheduleForDate } from "./scheduleUtils";

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
          // Create a delivery stop with items from the recurring order
          const { error: createStopError } = await supabase
            .from('delivery_stops')
            .insert({
              master_schedule_id: scheduleId,
              customer_id: recurringOrder.customer_id,
              customer_name: customer.name,
              customer_address: customer.address || '',
              customer_phone: customer.phone || '',
              status: 'pending',
              is_recurring: true,
              recurring_id: recurringOrderId,
              items: recurringOrder.items || '', // Include items from recurring order
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
    console.log("Starting syncAllRecurringOrders process");
    
    // Fetch all active recurring orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('active_status', true);
      
    if (ordersError) {
      console.error("Error fetching recurring orders:", ordersError);
      throw ordersError;
    }
    
    if (!activeOrders || activeOrders.length === 0) {
      console.log("No active recurring orders found");
      return { success: true, processed: 0 };
    }
    
    console.log(`Found ${activeOrders.length} active recurring orders to process`);
    
    // Group orders by date to consolidate schedules
    const ordersByDate: Record<string, any[]> = {};
    const today = startOfDay(new Date());
    let processedCount = 0;
    
    // Calculate the next occurrence for each order and group by date
    for (const order of activeOrders) {
      console.log(`Processing recurring order ID: ${order.id}, Customer: ${order.customer?.name}, Frequency: ${order.frequency}, Preferred day: ${order.preferred_day}`);
      
      try {
        const occurrences = calculateNextOccurrences(
          today,
          order.frequency,
          order.preferred_day,
          5 // Look ahead 5 occurrences
        );
        
        if (occurrences.length === 0) {
          console.warn(`No occurrences found for order ID: ${order.id}`);
          continue;
        }
        
        console.log(`Found ${occurrences.length} upcoming occurrences for order ID: ${order.id}`);
        
        // Add to date groups
        for (const occurrence of occurrences) {
          const dateStr = format(occurrence, 'yyyy-MM-dd');
          
          if (!ordersByDate[dateStr]) {
            ordersByDate[dateStr] = [];
          }
          
          ordersByDate[dateStr].push(order);
        }
      } catch (error) {
        console.error(`Error processing recurring order ${order.id}:`, error);
      }
    }
    
    console.log(`Grouped recurring orders by ${Object.keys(ordersByDate).length} unique dates`);
    
    // Process each date and create/update schedules
    for (const [dateStr, orders] of Object.entries(ordersByDate)) {
      console.log(`Processing date: ${dateStr} with ${orders.length} recurring orders`);
      
      // Find or create a schedule for this date
      let scheduleId: string;
      
      // Check if a schedule already exists
      const existingSchedules = await findSchedulesForDateBasic(dateStr);
      
      if (existingSchedules.length > 0) {
        console.log(`Found existing schedule for date ${dateStr}: ID ${existingSchedules[0].id}`);
        scheduleId = existingSchedules[0].id;
      } else {
        // Create a new schedule
        try {
          const newSchedule = await createScheduleForDate(dateStr);
          console.log(`Created new schedule for date ${dateStr}: ID ${newSchedule.id}`);
          scheduleId = newSchedule.id;
        } catch (error) {
          console.error(`Error creating schedule for date ${dateStr}:`, error);
          continue;
        }
      }
      
      // Add each order to the schedule
      for (const order of orders) {
        // Check if the order is already linked to this schedule
        const { data: existingLinks, error: linkError } = await supabase
          .from('recurring_order_schedules')
          .select('id')
          .eq('recurring_order_id', order.id)
          .eq('schedule_id', scheduleId);
          
        if (linkError) {
          console.error(`Error checking for existing links: ${linkError.message}`);
          continue;
        }
        
        // Link the recurring order to this schedule if not already linked
        if (!existingLinks || existingLinks.length === 0) {
          console.log(`Linking recurring order ${order.id} to schedule ${scheduleId}`);
          
          const { error: insertError } = await supabase
            .from('recurring_order_schedules')
            .insert({
              recurring_order_id: order.id,
              schedule_id: scheduleId,
              status: 'active'
            });
            
          if (insertError) {
            console.error(`Error creating link: ${insertError.message}`);
            continue;
          }
        } else {
          console.log(`Recurring order ${order.id} already linked to schedule ${scheduleId}`);
        }
        
        // Create a delivery stop for this customer if not exists
        const { data: existingStops, error: stopError } = await supabase
          .from('delivery_stops')
          .select('id')
          .eq('master_schedule_id', scheduleId)
          .eq('customer_id', order.customer_id);
          
        if (stopError) {
          console.error(`Error checking for existing stops: ${stopError.message}`);
          continue;
        }
        
        if (!existingStops || existingStops.length === 0) {
          console.log(`Creating delivery stop for customer ${order.customer.name} in schedule ${scheduleId}`);
          
          // Create a delivery stop
          const { error: createStopError } = await supabase
            .from('delivery_stops')
            .insert({
              master_schedule_id: scheduleId,
              customer_id: order.customer_id,
              customer_name: order.customer?.name || '',
              customer_address: order.customer?.address || '',
              customer_phone: order.customer?.phone || '',
              status: 'pending',
              is_recurring: true,
              recurring_id: order.id,
              notes: `Auto-generated from recurring order (${order.frequency})`,
              items: order.items || ''
            });
            
          if (createStopError) {
            console.error(`Error creating stop: ${createStopError.message}`);
            continue;
          }
          
          processedCount++;
        } else {
          console.log(`Delivery stop for customer ${order.customer?.name} already exists in schedule ${scheduleId}`);
        }
      }
    }
    
    console.log(`Completed syncAllRecurringOrders process. Processed ${processedCount} orders`);
    
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
