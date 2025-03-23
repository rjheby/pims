
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const createRecurringOrderFromSchedule = async (
  scheduleId: string,
  recurrenceData: {
    frequency: string;
    preferredDay: string;
    preferredTime?: string | Date;
    startDate?: Date;
    endDate?: Date;
  },
  toast: any
) => {
  try {
    // First get the schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('dispatch_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();
      
    if (scheduleError) throw scheduleError;
    
    // Get the delivery stops for this schedule to find customer info
    const { data: stops, error: stopsError } = await supabase
      .from('delivery_stops')
      .select(`
        *,
        customers:customer_id (
          id, 
          name, 
          address, 
          phone
        )
      `)
      .eq('master_schedule_id', scheduleId);
      
    if (stopsError) throw stopsError;
    
    if (!stops || stops.length === 0) {
      throw new Error("No delivery stops found for this schedule");
    }
    
    // Use the first stop's customer for the recurring order
    // In a real implementation, you might want to confirm with user which customer 
    // or create multiple recurring orders if the schedule has multiple customers
    const firstStop = stops[0];
    
    // Format the preferred time as a string if it's a Date
    let preferredTimeStr = recurrenceData.preferredTime as string;
    if (recurrenceData.preferredTime instanceof Date) {
      const hours = recurrenceData.preferredTime.getHours().toString().padStart(2, '0');
      const minutes = recurrenceData.preferredTime.getMinutes().toString().padStart(2, '0');
      preferredTimeStr = `${hours}:${minutes}`;
    }
    
    // Create the recurring order
    const { data: recurringOrder, error: createError } = await supabase
      .from('recurring_orders')
      .insert({
        customer_id: firstStop.customer_id,
        frequency: recurrenceData.frequency,
        preferred_day: recurrenceData.preferredDay.toLowerCase(),
        preferred_time: preferredTimeStr,
        active_status: true
      })
      .select()
      .single();
      
    if (createError) throw createError;
    
    // Create an entry in the recurring_order_schedules join table
    const { error: joinError } = await supabase
      .from('recurring_order_schedules')
      .insert({
        recurring_order_id: recurringOrder.id,
        schedule_id: scheduleId,
        status: 'active',
        modified_from_template: false
      });
      
    if (joinError) {
      // If there's an error creating the join record, 
      // we should clean up the recurring order
      await supabase
        .from('recurring_orders')
        .delete()
        .eq('id', recurringOrder.id);
        
      throw joinError;
    }
    
    toast({
      title: "Success",
      description: "Recurring order created successfully"
    });
    
    return recurringOrder;
  } catch (error: any) {
    console.error("Error creating recurring order:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to create recurring order",
      variant: "destructive"
    });
    return null;
  }
};

export const getRecurringOrderInfo = async (scheduleId: string) => {
  try {
    const { data, error } = await supabase
      .from('recurring_order_schedules')
      .select(`
        recurring_order_id,
        modified_from_template,
        recurring_orders (
          id,
          frequency,
          preferred_day,
          preferred_time,
          customers:customer_id (
            id,
            name,
            address,
            phone
          )
        )
      `)
      .eq('schedule_id', scheduleId)
      .maybeSingle();
      
    if (error) throw error;
    
    if (!data) return null;
    
    // Fix the TypeScript errors by correctly handling the nested data structure
    const recurringOrderInfo = {
      recurring_order_id: data.recurring_order_id,
      modified_from_template: data.modified_from_template,
      recurring_orders: data.recurring_orders // This is a single object, not an array
    };
    
    return recurringOrderInfo;
  } catch (error) {
    console.error("Error getting recurring order info:", error);
    return null;
  }
};

export const updateRecurringSchedule = async (
  scheduleId: string,
  updates: any,
  updateType: 'single' | 'future' | 'all',
  toast: any
) => {
  try {
    // First check if this is a recurring schedule
    const { data: relationship, error: relError } = await supabase
      .from('recurring_order_schedules')
      .select('recurring_order_id')
      .eq('schedule_id', scheduleId)
      .maybeSingle();
    
    if (relError) throw relError;
    
    if (!relationship) {
      // Not a recurring schedule, just update normally
      const { error } = await supabase
        .from('dispatch_schedules')
        .update(updates)
        .eq('id', scheduleId);
      
      if (error) throw error;
      
      return true;
    }
    
    // This is a recurring schedule
    const recurringOrderId = relationship.recurring_order_id;
    
    if (updateType === 'single') {
      // Update just this schedule and mark as modified from template
      const { error: updateError } = await supabase
        .from('dispatch_schedules')
        .update(updates)
        .eq('id', scheduleId);
      
      if (updateError) throw updateError;
      
      // Mark as modified from template
      const { error: relUpdateError } = await supabase
        .from('recurring_order_schedules')
        .update({ modified_from_template: true })
        .eq('schedule_id', scheduleId);
      
      if (relUpdateError) throw relUpdateError;
    } 
    else if (updateType === 'future') {
      // Get the schedule date
      const { data: schedule, error: scheduleError } = await supabase
        .from('dispatch_schedules')
        .select('schedule_date')
        .eq('id', scheduleId)
        .single();
      
      if (scheduleError) throw scheduleError;
      
      // Find all schedules related to this recurring order with date >= this schedule's date
      const { data: futureRelationships, error: futureError } = await supabase
        .from('recurring_order_schedules')
        .select(`
          schedule_id,
          dispatch_schedules:schedule_id (
            id,
            schedule_date
          )
        `)
        .eq('recurring_order_id', recurringOrderId);
      
      if (futureError) throw futureError;
      
      // Fix: Properly check and process the nested data
      if (futureRelationships && futureRelationships.length > 0) {
        // Filter to only include future schedules
        const futureScheduleIds = futureRelationships
          .filter(rel => {
            if (!rel.dispatch_schedules || !schedule) return false;
            // The dispatch_schedules property is an object, not an array
            const scheduleDate = new Date(rel.dispatch_schedules.schedule_date);
            const thisDate = new Date(schedule.schedule_date);
            return scheduleDate >= thisDate;
          })
          .map(rel => rel.schedule_id);
        
        // Update all future schedules
        for (const futureId of futureScheduleIds) {
          const { error: updateError } = await supabase
            .from('dispatch_schedules')
            .update(updates)
            .eq('id', futureId);
          
          if (updateError) console.error(`Error updating schedule ${futureId}:`, updateError);
        }
      }
    }
    else if (updateType === 'all') {
      // Update all schedules related to this recurring order
      const { data: allRelationships, error: allError } = await supabase
        .from('recurring_order_schedules')
        .select('schedule_id')
        .eq('recurring_order_id', recurringOrderId);
      
      if (allError) throw allError;
      
      // Update all related schedules
      const allScheduleIds = allRelationships?.map(rel => rel.schedule_id) || [];
      
      for (const schedId of allScheduleIds) {
        const { error: updateError } = await supabase
          .from('dispatch_schedules')
          .update(updates)
          .eq('id', schedId);
        
        if (updateError) console.error(`Error updating schedule ${schedId}:`, updateError);
      }
      
      // Also update the recurring order template if needed
      // This would depend on what fields are being updated
      // For simplicity, we're not implementing this part here
    }
    
    toast({
      title: "Success",
      description: `Schedule ${updateType === 'single' ? 'occurrence' : 
        updateType === 'future' ? 'and future occurrences' : 'and all occurrences'} updated successfully`
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating recurring schedule:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to update recurring schedule",
      variant: "destructive"
    });
    return false;
  }
};
