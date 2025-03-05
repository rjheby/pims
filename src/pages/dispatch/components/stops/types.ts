
import { Customer } from "@/pages/customers/types";

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  address?: string;
  is_active?: boolean;
  driver_type?: string;
  notes?: string;
}

export interface DeliveryStop {
  id?: string;
  customer_id: string | null;
  driver_id: string | null;
  items: string | null;
  notes: string | null;
  price?: number | null;
  stop_number?: number;
}

export interface StopFormData {
  customer_id: string | null;
  driver_id: string | null;
  items: string | null;
  notes: string | null;
  stop_number?: number;
}
