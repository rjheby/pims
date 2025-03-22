
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  // Helper to convert day name to number
  const dayToNumber = (day: string): number => {
    const days = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    return days[day.toLowerCase() as keyof typeof days] || 0;
  };

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

  // Generate schedule occurrences for a date range
  const generateOccurrences = (
    orders: RecurringOrder[], 
    start: Date = new Date(), 
    end: Date = new Date(new Date().setDate(new Date().getDate() + 30))
  ): ScheduledOccurrence[] => {
    const occurrences: ScheduledOccurrence[] = [];

    orders.forEach(order => {
      if (!order.preferred_day) return;
      
      const preferredDayNum = dayToNumber(order.preferred_day);
      let currentDate = new Date(start);
      
      // Adjust to start from today if start date is in the past
      if (currentDate < new Date()) {
        currentDate = new Date();
      }
      
      // Move to the next occurrence of preferred day
      while (currentDate.getDay() !== preferredDayNum) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Generate occurrences within the date range
      while (currentDate <= end) {
        occurrences.push({
          date: new Date(currentDate),
          recurringOrder: order,
          isAutoScheduled: true
        });
        
        // Add the next occurrence based on frequency
        switch (order.frequency) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'biweekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          default:
            currentDate.setDate(currentDate.getDate() + 7); // Default to weekly
        }
      }
    });
    
    return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
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
          status: 'pending'
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
      const occurrences = generateOccurrences(orders, startDate, endDate);
      setScheduledOccurrences(occurrences);
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
