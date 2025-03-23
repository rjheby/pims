
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interface for the join table between recurring orders and schedules
export interface RecurringOrderSchedule {
  id: string;
  recurring_order_id: string;
  schedule_id: string;
  status: string;
  modified_from_template: boolean;
  created_at: string;
}

/**
 * Fetches recurring templates with their related information
 */
export const fetchRecurringTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from('recurring_orders')
      .select(`
        id,
        customer_id,
        frequency,
        preferred_day,
        preferred_time,
        customers (id, name, address, phone)
      `)
      .eq('active_status', true);
    
    if (error) {
      console.error('Error fetching recurring templates:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching recurring templates:', error);
    return [];
  }
};

/**
 * Creates a schedule from a recurring template
 */
export const createScheduleFromRecurring = async (
  recurringOrderId: string, 
  scheduleDate: string,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  try {
    // Start a transaction by getting the recurring order
    const { data: recurringOrder, error: fetchError } = await supabase
      .from('recurring_orders')
      .select(`
        id,
        customer_id,
        frequency,
        preferred_day,
        preferred_time,
        customers (id, name, address, phone)
      `)
      .eq('id', recurringOrderId)
      .single();
    
    if (fetchError || !recurringOrder) {
      throw fetchError || new Error('Recurring order not found');
    }
    
    // Create new master schedule
    const { data: newSchedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .insert({
        schedule_date: scheduleDate,
        schedule_number: `SCH-${scheduleDate.replace(/-/g, '')}-${recurringOrder.customer_id.substring(0, 4)}`,
        status: 'draft',
        notes: `Generated from recurring order: ${recurringOrderId}`,
      })
      .select()
      .single();
    
    if (scheduleError || !newSchedule) {
      throw scheduleError || new Error('Failed to create schedule');
    }
    
    // Create join table entry
    const { error: joinError } = await supabase
      .from('recurring_order_schedules')
      .insert({
        recurring_order_id: recurringOrderId,
        schedule_id: newSchedule.id,
        status: 'pending',
        modified_from_template: false
      });
    
    if (joinError) throw joinError;
    
    // Create delivery stop
    const { error: stopError } = await supabase
      .from('delivery_stops')
      .insert({
        master_schedule_id: newSchedule.id,
        customer_id: recurringOrder.customer_id,
        customer_name: recurringOrder.customers?.name || 'Unknown',
        customer_address: recurringOrder.customers?.address || '',
        customer_phone: recurringOrder.customers?.phone || '',
        stop_number: 1,
        sequence: 1,
        status: 'pending',
        notes: `Auto-generated from recurring ${recurringOrder.frequency} order`,
        is_recurring: true,
        recurring_id: recurringOrderId
      });
    
    if (stopError) throw stopError;
    
    toast({
      title: "Schedule created",
      description: "Schedule created from recurring template"
    });
    
    return newSchedule;
  } catch (error: any) {
    console.error('Error creating schedule from recurring order:', error);
    toast({
      title: "Error",
      description: "Failed to create schedule from template: " + error.message,
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Update recurring schedule with different update strategies
 */
export const updateRecurringSchedule = async (
  scheduleId: string, 
  updates: any, 
  updateType: 'single' | 'future' | 'all',
  toast: ReturnType<typeof useToast>["toast"]
) => {
  try {
    // Get the recurring relationship
    const { data: relationship, error: relError } = await supabase
      .from('recurring_order_schedules')
      .select('recurring_order_id')
      .eq('schedule_id', scheduleId)
      .maybeSingle();
    
    if (relError) throw relError;
    
    if (!relationship) {
      // This is not a recurring schedule, just update normally
      const { error } = await supabase
        .from('dispatch_schedules')
        .update(updates)
        .eq('id', scheduleId);
      
      if (error) throw error;
    } else {
      // This is a recurring schedule
      if (updateType === 'single') {
        // Update just this instance and mark as modified
        const { error } = await supabase
          .from('dispatch_schedules')
          .update(updates)
          .eq('id', scheduleId);
        
        if (error) throw error;
        
        // Mark as modified from template
        await supabase
          .from('recurring_order_schedules')
          .update({ modified_from_template: true })
          .eq('schedule_id', scheduleId);
          
      } else if (updateType === 'future' || updateType === 'all') {
        // Get the date from this schedule
        const { data: schedule, error: scheduleError } = await supabase
          .from('dispatch_schedules')
          .select('schedule_date')
          .eq('id', scheduleId)
          .single();
        
        if (scheduleError) throw scheduleError;
        
        // Get all related schedules based on updateType
        let query = supabase
          .from('recurring_order_schedules')
          .select('schedule_id')
          .eq('recurring_order_id', relationship.recurring_order_id);
        
        if (updateType === 'future') {
          // Join to get only future schedules
          const { data: futureSchedules, error: futureError } = await supabase
            .from('dispatch_schedules')
            .select('id')
            .gte('schedule_date', schedule.schedule_date);
          
          if (futureError) throw futureError;
          
          // Get intersection of related recurring schedules and future schedules
          const futureIds = new Set(futureSchedules.map((s: any) => s.id));
          const { data: relatedSchedules, error: relatedError } = await supabase
            .from('recurring_order_schedules')
            .select('schedule_id')
            .eq('recurring_order_id', relationship.recurring_order_id);
          
          if (relatedError) throw relatedError;
          
          // Filter related schedules to only include future schedules
          const futuresToUpdate = relatedSchedules
            .filter((rel: any) => futureIds.has(rel.schedule_id))
            .map((rel: any) => rel.schedule_id);
          
          // Update each future schedule
          for (const schedId of futuresToUpdate) {
            await supabase
              .from('dispatch_schedules')
              .update(updates)
              .eq('id', schedId);
          }
        } else if (updateType === 'all') {
          // Get all related schedules
          const { data: relatedSchedules, error: relatedError } = await supabase
            .from('recurring_order_schedules')
            .select('schedule_id')
            .eq('recurring_order_id', relationship.recurring_order_id);
          
          if (relatedError) throw relatedError;
          
          // Update all related schedules
          for (const rel of relatedSchedules) {
            await supabase
              .from('dispatch_schedules')
              .update(updates)
              .eq('id', rel.schedule_id);
          }
          
          // Update the recurring order template itself if needed
          // This depends on what fields are being updated
          const templateUpdates: any = {};
          if (updates.customer_id) templateUpdates.customer_id = updates.customer_id;
          if (updates.preferred_day) templateUpdates.preferred_day = updates.preferred_day;
          if (updates.preferred_time) templateUpdates.preferred_time = updates.preferred_time;
          
          if (Object.keys(templateUpdates).length > 0) {
            await supabase
              .from('recurring_orders')
              .update(templateUpdates)
              .eq('id', relationship.recurring_order_id);
          }
        }
      }
    }
    
    toast({
      title: "Schedule updated",
      description: updateType === 'single' 
        ? "This occurrence has been updated" 
        : updateType === 'future'
        ? "This and future occurrences have been updated"
        : "All occurrences have been updated"
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating recurring schedule:', error);
    toast({
      title: "Error",
      description: "Failed to update schedule: " + error.message,
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Creates a recurring order from a schedule
 */
export const createRecurringOrderFromSchedule = async (
  scheduleId: string,
  recurrenceData: {
    frequency: string;
    preferredDay: string;
    preferredTime?: string;
    startDate?: string;
    endDate?: string;
  },
  toast: ReturnType<typeof useToast>["toast"]
) => {
  try {
    // Fetch the schedule to get customer information
    const { data: schedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select(`
        id,
        schedule_date,
        delivery_stops (
          customer_id,
          customer_name,
          items,
          notes
        )
      `)
      .eq('id', scheduleId)
      .single();
    
    if (scheduleError || !schedule || !schedule.delivery_stops || schedule.delivery_stops.length === 0) {
      throw scheduleError || new Error('Schedule not found or has no stops');
    }
    
    const stop = schedule.delivery_stops[0];
    
    // Create the recurring order
    const { data: newRecurringOrder, error: createError } = await supabase
      .from('recurring_orders')
      .insert({
        customer_id: stop.customer_id,
        frequency: recurrenceData.frequency,
        preferred_day: recurrenceData.preferredDay,
        preferred_time: recurrenceData.preferredTime,
        active_status: true
      })
      .select()
      .single();
    
    if (createError || !newRecurringOrder) {
      throw createError || new Error('Failed to create recurring order');
    }
    
    // Create join table entry to link this schedule to the recurring order
    const { error: joinError } = await supabase
      .from('recurring_order_schedules')
      .insert({
        recurring_order_id: newRecurringOrder.id,
        schedule_id: scheduleId,
        status: 'active',
        modified_from_template: false
      });
    
    if (joinError) throw joinError;
    
    // Update the delivery stops to mark them as recurring
    const { error: stopUpdateError } = await supabase
      .from('delivery_stops')
      .update({
        is_recurring: true,
        recurring_id: newRecurringOrder.id
      })
      .eq('master_schedule_id', scheduleId);
    
    if (stopUpdateError) throw stopUpdateError;
    
    toast({
      title: "Recurring order created",
      description: `Created ${recurrenceData.frequency} recurring order for ${stop.customer_name}`
    });
    
    return newRecurringOrder;
  } catch (error: any) {
    console.error('Error creating recurring order from schedule:', error);
    toast({
      title: "Error",
      description: "Failed to create recurring order: " + error.message,
      variant: "destructive"
    });
    return null;
  }
};

/**
 * Checks if a schedule is part of a recurring series
 */
export const isRecurringSchedule = async (scheduleId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('recurring_order_schedules')
      .select('id')
      .eq('schedule_id', scheduleId)
      .maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking if schedule is recurring:', error);
    return false;
  }
};

/**
 * Gets recurring order info for a schedule
 */
export const getRecurringInfoForSchedule = async (scheduleId: string) => {
  try {
    const { data, error } = await supabase
      .from('recurring_order_schedules')
      .select(`
        id,
        recurring_order_id,
        modified_from_template,
        recurring_orders (
          id,
          customer_id,
          frequency,
          preferred_day,
          preferred_time,
          customers (
            id,
            name
          )
        )
      `)
      .eq('schedule_id', scheduleId)
      .maybeSingle();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting recurring info for schedule:', error);
    return null;
  }
};
