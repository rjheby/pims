
export interface FirewoodProduct {
  id: number;
  item_name: string;
  item_full_name: string;
  species?: string;
  length?: string;
  split_size?: string;
  package_size?: string;
  product_type?: string;
  minimum_quantity?: number;
  image_reference?: string;
}

export interface RecurringOrderSettings {
  isRecurring: boolean;
  frequency: string;
  preferredDay?: string;
  startDate?: string;
  endDate?: string;
}

export interface DeliveryStop {
  id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items?: string;
  price?: number;
  status?: string;
  recurring?: RecurringOrderSettings;
  notes?: string;
  driver_id?: string;
  driver_name?: string;
  sequence?: number;
  stop_number?: number;
  master_schedule_id?: string;
  created_at?: string;
  updated_at?: string;
}
