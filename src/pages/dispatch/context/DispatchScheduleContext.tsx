
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a stop
interface Stop {
  id?: string;
  customer_id: string;
  driver_id: string | null;
  items?: string;
  notes?: string;
  sequence: number;
  customers?: any; // For joined customer data
}

// Define the context shape
interface DispatchScheduleContextType {
  stops: Stop[];
  addStop: (stop: Stop) => void;
  removeStop: (index: number) => void;
  updateStop: (index: number, stop: Stop) => void;
  clearStops: () => void;
}

// Create the context with default values
const DispatchScheduleContext = createContext<DispatchScheduleContextType>({
  stops: [],
  addStop: () => {},
  removeStop: () => {},
  updateStop: () => {},
  clearStops: () => {},
});

// Export a hook to use the context
export const useDispatchSchedule = () => useContext(DispatchScheduleContext);

// Create a provider component
export const DispatchScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [stops, setStops] = useState<Stop[]>([]);

  const addStop = (stop: Stop) => {
    setStops(prev => [...prev, stop]);
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
        addStop,
        removeStop,
        updateStop,
        clearStops,
      }}
    >
      {children}
    </DispatchScheduleContext.Provider>
  );
};
