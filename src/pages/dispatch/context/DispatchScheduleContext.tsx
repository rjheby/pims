
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DeliveryStop } from './stops/types';
import { supabase } from '@/integrations/supabase/client';

// Define the shape of a stop with all necessary properties
interface Stop {
  id?: string;
  customer_id: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id: string | null;
  items?: string;
  notes?: string;
  sequence: number;
  price?: number | string;
  is_recurring?: boolean;
  recurring_id?: string;
  stop_number: number;
  status?: string;
}

// Schedule data interface
interface ScheduleData {
  date: Date | null;
  number?: string;
  status?: string;
}

// Define the context shape with all required properties
interface DispatchScheduleContextType {
  stops: Stop[];
  scheduleData: ScheduleData;
  setScheduleDate: (date: Date) => void;
  customers: any[];
  drivers: any[];
  loading: boolean;
  addStop: (stop: Stop) => void;
  addStops: (stops: Stop[]) => void;
  removeStop: (index: number) => void;
  updateStop: (index: number, stop: Stop) => void;
  clearStops: () => void;
}

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
      }}
    >
      {children}
    </DispatchScheduleContext.Provider>
  );
};
