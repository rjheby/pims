
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateRecurringDates } from '../utils/timeWindowUtils';

export interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  preferred_time?: string;
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

  // Fetch recurring orders
  const fetchRecurringOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("recurring_orders")
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
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setRecurringOrders(data || []);
      return data || [];
    } catch (error: any) {
      console.error("Error fetching recurring orders:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load recurring orders: " + error.message,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate schedule occurrences for a date range using our improved time window utilities
  const generateOccurrences = (
    orders: RecurringOrder[], 
    start: Date = new Date(), 
    end: Date = new Date(new Date().setDate(new Date().getDate() + 30))
  ): ScheduledOccurrence[] => {
    const occurrences: ScheduledOccurrence[] = [];

    orders.forEach(order => {
      if (!order.preferred_day) return;
      
      // Use the calculateRecurringDates utility to get all dates in the range
      const dates = calculateRecurringDates(
        order.frequency,
        order.preferred_day,
        start,
        end
      );
      
      // Create an occurrence for each date
      dates.forEach(date => {
        occurrences.push({
          date: new Date(date),
          recurringOrder: order,
          isAutoScheduled: true
        });
      });
    });
    
    // Sort by date
    const sortedOccurrences = occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
    setScheduledOccurrences(sortedOccurrences);
    return sortedOccurrences;
  };

  // Add recurring order occurrence to a schedule
  const addOccurrenceToSchedule = async (
    occurrence: ScheduledOccurrence, 
    scheduleId: string
  ) => {
    try {
      const { recurringOrder, date } = occurrence;
      const customer = recurringOrder.customer;
      
      if (!customer) {
        throw new Error("Customer information not available");
      }
      
      // Create a delivery stop for the recurring order
      const { data, error } = await supabase
        .from("delivery_stops")
        .insert({
          master_schedule_id: scheduleId,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_address: customer.address || '',
          customer_phone: customer.phone || '',
          notes: `Recurring ${recurringOrder.frequency} order`, 
          status: 'pending',
          is_recurring: true,
          recurring_id: recurringOrder.id
        })
        .select();
        
      if (error) throw error;
      
      return data[0];
    } catch (error: any) {
      console.error("Error adding occurrence to schedule:", error);
      toast({
        title: "Error",
        description: "Failed to add recurring order to schedule: " + error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Initialize and generate occurrences when start/end dates change
  useEffect(() => {
    if (!startDate || !endDate) return;
    
    const init = async () => {
      const orders = await fetchRecurringOrders();
      generateOccurrences(orders, startDate, endDate);
    };
    
    init();
  }, [startDate, endDate]);

  return {
    recurringOrders,
    scheduledOccurrences,
    loading,
    error,
    fetchRecurringOrders,
    generateOccurrences,
    addOccurrenceToSchedule
  };
}
