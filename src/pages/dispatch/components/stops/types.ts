
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

export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  type?: string;
}

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface StopFormData {
  customer_id: string | null;
  notes: string | null;
  driver_id: string | null;
  items: string | null;
  stop_number?: number;
}

export const DELIVERY_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export const getStatusBadgeVariant = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    case 'scheduled':
    default:
      return 'outline';
  }
};
