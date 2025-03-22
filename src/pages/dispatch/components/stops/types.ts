
export interface RecurrenceData {
  isRecurring: boolean;
  frequency: string;
  preferredDay?: string;
  startDate?: string;
  endDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  notes?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface DeliveryStop {
  id?: string;
  stop_number: number;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id?: string;
  driver_name?: string;
  items?: string;
  itemsData?: any[];
  notes?: string;
  price?: number | string;
  status?: string;
  is_recurring?: boolean;
  recurring_id?: string;
  customer?: Customer;
  customers?: Customer;
  recurring?: RecurrenceData;
}

export interface StopFormData {
  id?: string;
  stop_number: number;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  driver_id?: string;
  driver_name?: string;
  items?: string;
  itemsData?: any[];
  notes?: string;
  price?: number | string;
  status?: string;
  is_recurring?: boolean;
  recurring_id?: string;
}

// Status options for delivery stops
export const DELIVERY_STATUS_OPTIONS = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "failed"
];

export type DeliveryStatus = typeof DELIVERY_STATUS_OPTIONS[number];

// Helper function to get badge variant based on status
export const getStatusBadgeVariant = (status: string): "default" | "outline" | "secondary" | "destructive" | "success" => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "failed":
      return "destructive";
    case "pending":
    default:
      return "outline";
  }
};
