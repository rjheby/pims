export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  notes?: string;
  type?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
}

export interface DeliveryStop {
  id?: string;
  master_schedule_id: string;
  customer_id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  stop_number: number;
  items: string;
  notes?: string;
  price?: number;
  driver_id?: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  is_recurring?: boolean;
  recurring_id?: string;
  customers?: Customer;
  drivers?: Driver;
  itemsData?: any[];
}

export interface StopFormData {
  customer_id: string;
  items: string;
  notes?: string;
  price?: number;
  driver_id?: string | null;
}

export interface RecurringOrderSchedule {
  id: string;
  recurring_order_id: string;
  schedule_id: string;
  status: string;
  modified_from_template: boolean;
}

// Add startDate and endDate to RecurringOrder interface
export interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  items: string | any[];
  active_status: boolean;
  preferred_time?: string;
  startDate?: string;
  endDate?: string;
  customer?: Customer;
}
