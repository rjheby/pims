
// Order-related interfaces
export interface WholesaleOrderItem {
  id: string;
  wood_product_id?: string;
  product_description?: string;
  unitCost: number;
  pallets: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
}

export interface WholesaleOrder {
  id?: string;
  customer_id?: string;
  order_date: string;
  delivery_date?: string | null;
  items: WholesaleOrderItem[];
  notes?: string;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  order_number: string;
  status?: string;
}

// OrderItem type for OrderTable
export interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;
  productId?: string;
}

// OrderTable dropdown options
export interface DropdownOptions {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
}
