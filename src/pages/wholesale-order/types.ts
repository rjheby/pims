export interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;
  isCompressed?: boolean;
  productId?: string; // Add productId property
}

export interface WholesaleOrderItem {
  id: string;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;
}

export interface WholesaleOrder {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date?: string | null;
  items: WholesaleOrderItem[];
  status: string;
  submitted_at?: string;
}

export interface DropdownOptions {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
}

export const emptyOptions: DropdownOptions = {
  species: [],
  length: [],
  bundleType: [],
  thickness: [],
  packaging: []
};

// Inventory and product types
export interface RetailInventoryItem {
  id: string;
  firewood_product_id: number;
  packages_available: number;
  packages_allocated: number;
  total_packages: number;
  last_updated: string;
}

export interface FirewoodProduct {
  id: number;
  item_name: string;
  item_full_name: string;
  species: string;
  length: string;
  split_size: string;
  package_size: string;
  product_type: string;
  minimum_quantity: number;
  image_reference?: string;
  is_popular?: boolean;
  popularity_rank?: number;
}

export interface ProcessingRecord {
  id: string;
  wood_product_id: string;
  firewood_product_id: number;
  wholesale_pallets_used: number;
  retail_packages_created: number;
  actual_conversion_ratio: number;
  processed_date: string;
  expected_ratio?: number;
  processed_by: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  wood_product_id: string;
  total_pallets: number;
  pallets_available: number;
  pallets_allocated: number;
  last_updated: string;
  location?: string;
  notes?: string;
}

export interface WoodProduct {
  id: string;
  species: string;
  length: string;
  bundle_type: string;
  thickness: string;
  unit_cost: number;
  is_popular?: boolean;
  popularity_rank?: number;
  full_description: string;
  created_at?: string;
}

// Add missing "pizza wood" product definition
export const PIZZA_WOOD_PRODUCT = {
  id: "pizza-wood-001",
  species: "Oak",
  length: "16\"",
  bundle_type: "Premium",
  thickness: "Standard Split",
  unit_cost: 45,
  is_popular: true,
  full_description: "Premium oak pizza wood bundle - ideal for wood-fired ovens",
};

// Utility functions
export const generateEmptyOrderItem = (): OrderItem => ({
  id: Date.now(),
  species: "",
  length: "",
  bundleType: "",
  thickness: "",
  packaging: "Pallets",
  pallets: 0,
  unitCost: 250,
});

export const serializeOrderItems = (items: OrderItem[]): string => {
  return JSON.stringify(items.map(item => ({
    ...item,
    id: undefined,
    isCompressed: undefined
  })));
};

export const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Supabase related constants and utility functions
export enum supabaseTable {
  inventory_items = 'inventory_items',
  wood_products = 'wood_products',
  retail_inventory = 'retail_inventory',
  firewood_products = 'firewood_products',
  processing_records = 'processing_records'
}

// Supabase safe-typing utilities
export function supabaseSafeFrom<T>(
  client: any,
  table: string
) {
  return client.from(table);
}

export function supabaseSafeRpc<T>(
  client: any,
  procedure: string,
  params?: Record<string, any>
) {
  return client.rpc(procedure, params);
}
