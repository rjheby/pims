
export interface Customer {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  type?: string;
  notes?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface RecurrenceData {
  isRecurring: boolean;
  frequency: string;
  preferredDay?: string;
  startDate?: string;
  endDate?: string;
}

export interface RecurringOrder {
  id: string;
  customer_id: string;
  created_at?: string;
  updated_at?: string;
  active_status?: boolean;
  preferred_day?: string;
  preferred_time?: string;
  items?: string;
  frequency: string;
  customer?: Customer;
}
