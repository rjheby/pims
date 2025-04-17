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

export interface Stop {
  id?: string;
  master_schedule_id?: string;
  customer_id: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  stop_number?: number;
  items: string;
  notes?: string;
  price?: number;
  driver_id?: string | null;
  status?: DeliveryStatus;
}

export interface DeliveryStop extends Stop {
  master_schedule_id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  stop_number: number;
  status: DeliveryStatus;
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export const DELIVERY_STATUS_OPTIONS = [
  { value: DeliveryStatus.PENDING, label: 'Pending' },
  { value: DeliveryStatus.IN_PROGRESS, label: 'In Progress' },
  { value: DeliveryStatus.COMPLETED, label: 'Completed' },
  { value: DeliveryStatus.CANCELLED, label: 'Cancelled' }
];

export interface RecurrenceData {
  frequency: string;
  preferredDay?: string;
  preferredTime?: string;
  startDate?: Date;
  endDate?: Date;
}

export const getStatusBadgeVariant = (status: DeliveryStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case DeliveryStatus.COMPLETED:
      return 'default';
    case DeliveryStatus.IN_PROGRESS:
      return 'secondary';
    case DeliveryStatus.CANCELLED:
      return 'destructive';
    default:
      return 'outline';
  }
};

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
