
export interface Driver {
  id: string;
  name: string;
  status?: string;
  created_at?: string;
}

export interface DeliveryStop {
  id?: string | number;
  customer_id: string | null;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id: string | null;
  driver_name?: string;
  items?: string | null;
  notes?: string | null;
  stop_number?: number;
  price?: number;
  sequence?: number;
  master_schedule_id?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StopFormData {
  customer_id: string | null;
  driver_id: string | null;
  items?: string | null;
  notes?: string | null;
  stop_number?: number;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
}
