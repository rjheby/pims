
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

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  active?: boolean;
  photo_url?: string;
  vehicle_type?: string;
  capacity?: number;
  notes?: string;
}

export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export interface DeliveryStop {
  id: string;
  schedule_id?: string;
  stop_number?: number;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id?: string;
  driver_name?: string;
  status?: DeliveryStatus;
  created_at?: string;
  updated_at?: string;
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
  items?: string;
  price?: number;
  itemsData?: Array<{name: string; quantity: number; price?: number}>;
  is_recurring?: boolean;
  recurring_id?: string;
}

export interface StopFormData {
  id?: string;
  stop_number?: number;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id?: string;
  driver_name?: string;
  items?: string;
  price?: number;
  notes?: string;
  status?: DeliveryStatus;
}

export const DELIVERY_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Failed', value: 'failed' }
];

export const getStatusBadgeVariant = (status: DeliveryStatus) => {
  switch (status) {
    case 'pending':
      return 'outline';
    case 'in_progress':
      return 'secondary';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
};
