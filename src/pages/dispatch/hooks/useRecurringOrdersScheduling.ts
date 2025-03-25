
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateNextOccurrences } from '../utils/recurringOccurrenceUtils';
import { format } from 'date-fns';

export interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  preferred_time?: string;
  active_status?: boolean;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface ScheduledOccurrence {
  date: Date;
  recurringOrder: RecurringOrder;
  isAutoScheduled: boolean;
}

export function useRecurringOrdersScheduling(startDate?: Date, endDate?: Date) {
  const [recurringOrders, setRecurringOrders] = useState<RecurringOrder[]>([]);
  const [scheduledOccurrences, setScheduledOccurrences] = useState<ScheduledOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch recurring orders with customer information
  const fetchRecurringOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching recurring orders...");
      
      // Direct Supabase query instead of using fetchWithFallback
      const { data, error } = await supabase
        .from('recurring_orders')
        .select(`
          *,
          customer:customer_id (
            id,
            name,
            address,
            phone,
            email
          )
        `)
        .eq('active_status', true)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching recurring orders:", error);
        setError(`Failed to load recurring orders: ${error.message}`);
        return [];
      }
      
      // Validate that necessary data is present
      const validOrders = (data || []).filter(order => 
        order.customer_id && order.frequency && order.preferred_day);
      
      if (validOrders.length < (data || []).length) {
        console.warn(`Filtered out ${(data || []).length - validOrders.length} invalid recurring orders`);
      }
      
      console.log(`Fetched ${validOrders.length} recurring orders`);
      setRecurringOrders(validOrders);
      return validOrders;
    } catch (error: any) {
      console.error("Error fetching recurring orders:", error);
      setError(`Failed to load recurring orders: ${error.message}`);
      toast({
        title: "Error",
        description: "Failed to load recurring orders: " + error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Generate schedule occurrences for a date range using the recurring occurrence utils
  const generateOccurrences = useCallback((
    orders: RecurringOrder[], 
    start: Date = new Date(), 
    end: Date = new Date(new Date().setDate(new Date().getDate() + 30))
  ): ScheduledOccurrence[] => {
    if (!start || !end) {
      console.warn("Invalid date range provided to generateOccurrences");
      return [];
    }
    
    console.log(`Generating occurrences from ${start.toISOString()} to ${end.toISOString()}`);
    console.log(`Processing ${orders.length} recurring orders`);
    
    const occurrences: ScheduledOccurrence[] = [];

    orders.forEach(order => {
      if (!order.preferred_day) {
        console.warn(`Order ${order.id} has no preferred_day, skipping`);
        return;
      }
      
      // Log the order details for debugging
      console.log(`Processing order: ${order.id}, Frequency: ${order.frequency}, Day: ${order.preferred_day}, Customer: ${order.customer?.name}`);
      
      try {
        // Use calculateNextOccurrences to get dates for this recurring order
        const dates = calculateNextOccurrences(
          start,
          order.frequency,
          order.preferred_day,
          30 // Look ahead 30 occurrences to ensure we catch all in the range
        );
        
        console.log(`calculateNextOccurrences returned ${dates.length} dates for order ${order.id}`);
        
        // Filter dates to only include those in the specified range
        const datesInRange = dates.filter(date => {
          const isInRange = date >= start && date <= end;
          if (!isInRange) {
            console.log(`Date ${date.toISOString()} is outside range: ${start.toISOString()} - ${end.toISOString()}`);
          }
          return isInRange;
        });
        
        console.log(`Found ${datesInRange.length} occurrences for order ${order.id} (${order.customer?.name}) within range`);
        
        // Create an occurrence for each date
        datesInRange.forEach(date => {
          occurrences.push({
            date: new Date(date),
            recurringOrder: order,
            isAutoScheduled: true
          });
        });
      } catch (error) {
        console.error(`Error generating occurrences for order ${order.id}:`, error);
      }
    });
    
    // Sort by date
    const sortedOccurrences = occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
    setScheduledOccurrences(sortedOccurrences);
    
    // Add additional debug info
    if (sortedOccurrences.length === 0) {
      console.warn("No occurrences found in the date range");
    } else {
      console.log(`Generated ${sortedOccurrences.length} total occurrences in date range`);
      // Log the first few occurrences for debugging
      sortedOccurrences.slice(0, 3).forEach(occurrence => {
        console.log(`Occurrence: ${format(occurrence.date, 'yyyy-MM-dd')} - ${occurrence.recurringOrder.customer?.name} (${occurrence.recurringOrder.frequency})`);
      });
    }
    
    return sortedOccurrences;
  }, []);

  // Check for conflicts with existing schedules
  const checkForScheduleConflicts = useCallback(async (occurrence: ScheduledOccurrence): Promise<boolean> => {
    try {
      const customer = occurrence.recurringOrder.customer;
      if (!customer) return false;
      
      // Format date for database query (YYYY-MM-DD)
      const formattedDate = occurrence.date.toISOString().split('T')[0];
      
      // Check if customer already has a delivery scheduled for this date
      const { data, error } = await supabase
        .from("delivery_schedules")
        .select("id")
        .eq("customer_id", customer.id)
        .eq("delivery_date", formattedDate);
        
      if (error) throw error;
      
      // Return true if conflicts exist
      return (data && data.length > 0);
    } catch (error) {
      console.error("Error checking for schedule conflicts:", error);
      return false;
    }
  }, []);

  // Initialize when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      console.log("Initializing recurring order scheduling with date range");
      fetchRecurringOrders()
        .then(orders => {
          generateOccurrences(orders, startDate, endDate);
        });
    }
  }, [startDate, endDate, fetchRecurringOrders, generateOccurrences]);

  return {
    recurringOrders,
    scheduledOccurrences,
    loading,
    error,
    fetchRecurringOrders,
    generateOccurrences,
    checkForScheduleConflicts
  };
}
