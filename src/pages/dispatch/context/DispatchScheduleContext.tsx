
import { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the stop item type
export interface ScheduleStop {
  id?: number;
  customer_id: string;
  driver_id: string | null;
  notes: string | null;
  items: string | null;
  sequence: number;
}

// Context type definition
interface DispatchScheduleContextType {
  scheduleNumber: string;
  scheduleDate: string;
  stops: ScheduleStop[];
  setStops: (stops: ScheduleStop[]) => void;
  addStop: (stop: ScheduleStop) => void;
  removeStop: (index: number) => void;
  updateStop: (index: number, stop: ScheduleStop) => void;
  handleScheduleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateScheduleNumber: (date: string) => Promise<string>;
}

// Create context with default values
const DispatchScheduleContext = createContext<DispatchScheduleContextType>({
  scheduleNumber: "",
  scheduleDate: new Date().toISOString().split('T')[0],
  stops: [],
  setStops: () => {},
  addStop: () => {},
  removeStop: () => {},
  updateStop: () => {},
  handleScheduleDateChange: () => {},
  generateScheduleNumber: async () => "",
});

// Context provider component
export function DispatchScheduleProvider({ children }: { children: React.ReactNode }) {
  const [scheduleNumber, setScheduleNumber] = useState("");
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [stops, setStops] = useState<ScheduleStop[]>([]);

  // Handle date change
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleDate(e.target.value);
  };

  // Add a new stop
  const addStop = (stop: ScheduleStop) => {
    setStops([...stops, stop]);
  };

  // Remove a stop
  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  // Update a stop
  const updateStop = (index: number, stop: ScheduleStop) => {
    const newStops = [...stops];
    newStops[index] = stop;
    setStops(newStops);
  };

  // Generate schedule number
  const generateScheduleNumber = async (date: string): Promise<string> => {
    try {
      // Get current date parts
      const dateParts = date.split('-');
      const year = dateParts[0];
      const month = dateParts[1];
      
      // Get the count of orders for this month
      const { count, error } = await supabase
        .from('dispatch_schedules')
        .select('*', { count: 'exact', head: true })
        .ilike('schedule_number', `DS-${year}${month}-%`);
        
      if (error) throw error;
      
      // Generate sequence number (padded with zeros)
      const sequence = String(Number(count || 0) + 1).padStart(3, '0');
      const newScheduleNumber = `DS-${year}${month}-${sequence}`;
      
      setScheduleNumber(newScheduleNumber);
      return newScheduleNumber;
    } catch (error) {
      console.error('Error generating schedule number:', error);
      // Fallback to a timestamp-based number
      const timestamp = new Date().getTime();
      const fallbackNumber = `DS-${timestamp}`;
      setScheduleNumber(fallbackNumber);
      return fallbackNumber;
    }
  };

  return (
    <DispatchScheduleContext.Provider
      value={{
        scheduleNumber,
        scheduleDate,
        stops,
        setStops,
        addStop,
        removeStop,
        updateStop,
        handleScheduleDateChange,
        generateScheduleNumber,
      }}
    >
      {children}
    </DispatchScheduleContext.Provider>
  );
}

// Hook for using the context
export function useDispatchSchedule() {
  const context = useContext(DispatchScheduleContext);
  if (!context) {
    throw new Error("useDispatchSchedule must be used within a DispatchScheduleProvider");
  }
  return context;
}
