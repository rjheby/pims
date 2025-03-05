
import { Customer } from "@/pages/customers/types";

export interface Driver {
  id: string;
  name: string;
}

export interface DeliveryStop {
  id?: number | string;
  customer_id: string | null;
  driver_id: string | null;
  notes: string | null;
  items: string | null;
  price?: number;
  customer_address?: string;
  customer_phone?: string;
  stop_number?: number;
  master_schedule_id?: string;
  customers?: Customer;
}

export interface StopFormData {
  customer_id: string;
  driver_id: string;
  notes: string;
  items: string;
}

export interface StopsTableProps {
  stops: DeliveryStop[];
  onStopsChange?: (stops: DeliveryStop[]) => void;
  masterScheduleId?: string;
  readOnly?: boolean;
  useMobileLayout?: boolean;
}
