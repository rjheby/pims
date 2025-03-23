
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Stop, ScheduleData, DispatchScheduleContextType } from './types';
import { supabase } from '@/integrations/supabase/client';

// Create the context with default values
const DispatchScheduleContext = createContext<DispatchScheduleContextType>({
  stops: [],
  scheduleData: { date: null },
  setScheduleDate: () => {},
  customers: [],
  drivers: [],
  loading: false,
  addStop: () => {},
  addStops: () => {},
  removeStop: () => {},
  updateStop: () => {},
  clearStops: () => {},
  loadRecurringOrders: () => Promise.resolve([]),
});

// Export a hook to use the context
export const useDispatchSchedule = () => useContext(DispatchScheduleContext);

// Create a provider component
export const DispatchScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({ date: null });
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch customers and drivers when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
          .order('name');
          
        if (customersError) throw customersError;
        
        const processedCustomers = customersData.map((customer: any) => ({
          ...customer,
          type: customer.type || 'RETAIL',
          address: customer.address || constructAddress(customer)
        }));
        
        setCustomers(processedCustomers);
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, phone, email, status')
          .eq('status', 'active') // Only active drivers
          .order('name');
          
        if (driversError) throw driversError;
        
        setDrivers(driversData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const constructAddress = (customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const setScheduleDate = (date: Date) => {
    setScheduleData(prev => ({ ...prev, date }));
    
    // When date changes, automatically check for recurring orders
    if (date) {
      loadRecurringOrders(date).then(recurringStops => {
        if (recurringStops.length > 0) {
          // Only add recurring stops that aren't already in the stops array
          const existingCustomerIds = stops.map(stop => stop.customer_id);
          const newStops = recurringStops.filter(stop => 
            !existingCustomerIds.includes(stop.customer_id)
          );
          
          if (newStops.length > 0) {
            addStops(newStops);
          }
        }
      });
    }
  };

  // Load recurring orders for a specific date
  const loadRecurringOrders = async (date: Date): Promise<Stop[]> => {
    try {
      console.log("Loading recurring orders for date:", date);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Get the day name (e.g., "monday", "tuesday") from the date
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Fetch recurring orders that match this day
      const { data: recurringData, error: recurringError } = await supabase
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
        .eq('preferred_day', dayName);
        
      if (recurringError) throw recurringError;
      
      if (!recurringData || recurringData.length === 0) {
        console.log("No recurring orders found for day:", dayName);
        return [];
      }
      
      console.log(`Found ${recurringData.length} recurring orders for ${dayName}`);
      
      // Convert to Stop format
      const recurringStops: Stop[] = recurringData
        .filter(order => {
          // Filter based on frequency
          // For weekly: always include
          if (order.frequency.toLowerCase() === 'weekly') return true;
          
          // For biweekly: check if this is the right week
          if (order.frequency.toLowerCase() === 'biweekly') {
            const orderCreation = new Date(order.created_at);
            const weeksDiff = Math.floor(
              (date.getTime() - orderCreation.getTime()) / 
              (7 * 24 * 60 * 60 * 1000)
            );
            return weeksDiff % 2 === 0;
          }
          
          // For monthly: check if this is the first occurrence of the day
          if (order.frequency.toLowerCase() === 'monthly') {
            const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const firstOccurrenceDate = new Date(firstDayOfMonth);
            
            // Find first occurrence of this day in the month
            while (
              firstOccurrenceDate.getMonth() === date.getMonth() && 
              firstOccurrenceDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() !== dayName
            ) {
              firstOccurrenceDate.setDate(firstOccurrenceDate.getDate() + 1);
            }
            
            // If this is the first occurrence date of this day in the month
            return date.getDate() === firstOccurrenceDate.getDate();
          }
          
          return false;
        })
        .map((order, index) => {
          const customer = order.customer;
          if (!customer) return null;
          
          const timeWindow = order.preferred_time || 'Any time';
          
          return {
            customer_id: customer.id,
            customer_name: customer.name,
            customer_address: customer.address || '',
            customer_phone: customer.phone || '',
            driver_id: null,
            items: '',
            notes: `Recurring ${order.frequency} order - Preferred: ${timeWindow}`,
            sequence: index,
            stop_number: stops.length + index + 1,
            is_recurring: true,
            recurring_id: order.id,
            status: 'pending'
          };
        })
        .filter(Boolean) as Stop[];
        
      console.log(`Converted ${recurringStops.length} recurring orders to stops`);
      return recurringStops;
    } catch (error) {
      console.error("Error loading recurring orders:", error);
      return [];
    }
  };

  const addStop = (stop: Stop) => {
    setStops(prev => [...prev, stop]);
  };

  const addStops = (newStops: Stop[]) => {
    setStops(prev => [...prev, ...newStops]);
  };

  const removeStop = (index: number) => {
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, stop: Stop) => {
    setStops(prev => {
      const newStops = [...prev];
      newStops[index] = stop;
      return newStops;
    });
  };

  const clearStops = () => {
    setStops([]);
  };

  return (
    <DispatchScheduleContext.Provider
      value={{
        stops,
        scheduleData,
        setScheduleDate,
        customers,
        drivers,
        loading,
        addStop,
        addStops,
        removeStop,
        updateStop,
        clearStops,
        loadRecurringOrders,
      }}
    >
      {children}
    </DispatchScheduleContext.Provider>
  );
};
