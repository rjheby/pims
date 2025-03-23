
// Define the shape of a stop with all necessary properties
export interface Stop {
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
export interface ScheduleData {
  date: Date | null;
  number?: string;
  status?: string;
}

// Define the context shape with all required properties
export interface DispatchScheduleContextType {
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
  loadRecurringOrders: (date: Date) => Promise<Stop[]>;
}
