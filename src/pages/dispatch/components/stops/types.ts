
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
  type?: string;  // Added type property to match customers/types.ts
}

export interface FirewoodProduct {
  id: number;
  item_name: string;
  item_full_name: string;
  species: string;
  length: string;
  package_size: string;
  product_type: string;
  split_size: string;
  minimum_quantity: number;
}

// Status options for delivery stops
export const DELIVERY_STATUS_OPTIONS = [
  "pending",
  "in process", 
  "scheduled", 
  "loaded", 
  "out for delivery", 
  "delivered", 
  "canceled", 
  "rescheduled"
];

// Get appropriate badge variant based on status
export const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "default";
    case "out for delivery":
      return "secondary";
    case "canceled":
      return "destructive";
    default:
      return "outline";
  }
};
