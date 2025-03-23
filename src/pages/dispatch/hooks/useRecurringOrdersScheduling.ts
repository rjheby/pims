
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { calculateRecurringDates, getFutureRecurringDates, isDateOnDay, getNextSpecificDay } from '../utils/timeWindowUtils';

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

  // Fetch recurring orders with customer information
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
      
      // Validate that necessary data is present
      const validOrders = (data || []).filter(order => 
        order.customer_id && order.frequency && order.preferred_day);
      
      if (validOrders.length < (data || []).length) {
        console.warn(`Filtered out ${(data || []).length - validOrders.length} invalid recurring orders`);
      }
      
      setRecurringOrders(validOrders);
      return validOrders;
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

  // Generate schedule occurrences for a date range using the time window utilities
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

  // Get occurrences specifically for a day of the week (e.g., "tuesday")
  const getOccurrencesForDay = (dayName: string, daysAhead: number = 30): ScheduledOccurrence[] => {
    const occurrences: ScheduledOccurrence[] = [];
    
    recurringOrders.forEach(order => {
      if (order.preferred_day?.toLowerCase() === dayName.toLowerCase()) {
        // Get all future occurrences for this day
        const dates = getFutureRecurringDates(order.frequency, order.preferred_day, daysAhead);
        
        dates.forEach(date => {
          occurrences.push({
            date: new Date(date),
            recurringOrder: order,
            isAutoScheduled: true
          });
        });
      }
    });
    
    return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Get the next occurrence of a specific day (e.g., get next Tuesday)
  const getNextDayOccurrences = (dayName: string): ScheduledOccurrence[] => {
    const occurrences: ScheduledOccurrence[] = [];
    const today = new Date();
    
    // Get the next date that falls on the specified day
    const nextDate = getNextSpecificDay(today, dayName);
    
    recurringOrders.forEach(order => {
      if (order.preferred_day?.toLowerCase() === dayName.toLowerCase()) {
        // Check if this order would occur on the next instance of the day
        const shouldOccur = isOrderDueOnDate(order, nextDate);
        
        if (shouldOccur) {
          occurrences.push({
            date: new Date(nextDate),
            recurringOrder: order,
            isAutoScheduled: true
          });
        }
      }
    });
    
    return occurrences;
  };

  // Check if an order is due on a specific date based on its frequency
  const isOrderDueOnDate = (order: RecurringOrder, date: Date): boolean => {
    if (!order.preferred_day || !isDateOnDay(date, order.preferred_day)) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For weekly orders, it occurs every week on the preferred day
    if (order.frequency.toLowerCase() === 'weekly') {
      return true;
    }
    
    // For biweekly orders, check if this is the right week
    if (order.frequency.toLowerCase() === 'biweekly') {
      // Calculate weeks since order creation
      const orderCreationDate = new Date(order.created_at);
      const weeksSinceCreation = Math.floor(
        (date.getTime() - orderCreationDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
      );
      
      // If weeks since creation is even, it's a biweekly occurrence
      return weeksSinceCreation % 2 === 0;
    }
    
    // For monthly orders, check if this is the first occurrence of the day in the month
    if (order.frequency.toLowerCase() === 'monthly') {
      // Get all occurrences of this day in the current month
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      
      let firstOccurrence = null;
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        if (isDateOnDay(currentDate, order.preferred_day)) {
          firstOccurrence = currentDate;
          break;
        }
      }
      
      // Check if the current date is the first occurrence
      return firstOccurrence !== null && 
             firstOccurrence.getDate() === date.getDate();
    }
    
    return false;
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
      
      // Now also create an entry in delivery_schedules to maintain proper relationships
      const { error: scheduleError } = await supabase
        .from("delivery_schedules")
        .insert({
          customer_id: customer.id,
          master_schedule_id: scheduleId,
          delivery_date: date.toISOString(),
          schedule_type: 'recurring',
          recurring_day: recurringOrder.preferred_day,
          status: 'pending',
          notes: `Auto-generated from recurring ${recurringOrder.frequency} order`
        });
        
      if (scheduleError) {
        console.error("Warning: Failed to create delivery schedule entry:", scheduleError);
      }
      
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
  
  // Check for conflicts with existing schedules
  const checkForScheduleConflicts = async (occurrence: ScheduledOccurrence): Promise<boolean> => {
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
    addOccurrenceToSchedule,
    checkForScheduleConflicts,
    getOccurrencesForDay,
    getNextDayOccurrences,
    isOrderDueOnDate
  };
}
