
import { SupabaseClient } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";

// Define types for Wholesale Order Form
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

// Empty options object for initial state
export const emptyOptions: DropdownOptions = {
  species: [],
  length: [],
  bundleType: [],
  thickness: [],
  packaging: []
};

// Initial options with some default values for fallback
export const initialOptions: DropdownOptions = {
  species: [],
  length: [],
  bundleType: [],
  thickness: [],
  packaging: ["Pallets", "Crates", "Boxes", "12x10\" Boxes"]
};

// Utility functions for OrderTable
export const safeNumber = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export const calculateItemTotal = (item: OrderItem): number => {
  return safeNumber(item.pallets) * safeNumber(item.unitCost);
};

export const serializeOrderItems = (items: OrderItem[]): OrderItem[] => {
  return items.map(item => ({
    ...item,
    pallets: safeNumber(item.pallets),
    unitCost: safeNumber(item.unitCost)
  }));
};

// Product conversion type
export interface ProductConversion {
  id: string;
  wood_product_id: string;
  firewood_product_id: number;
  conversion_ratio: number;
  expected_ratio: number;
  notes?: string;
}

// Define types for Wood Products (Raw Materials)
export interface WoodProduct {
  id: string;
  species: string;
  length: string;
  thickness: string;
  bundle_type: string;
  full_description: string;
  unit_cost: number;
  is_popular?: boolean;
  popularity_rank?: number;
}

// Define types for Inventory Items
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

// Define types for Retail Inventory
export interface RetailInventoryItem {
  id: string;
  firewood_product_id: number;
  total_packages: number;
  packages_available: number;
  packages_allocated: number;
  last_updated: string;
  warehouse_location?: string;
  notes?: string;
}

// Define types for Firewood Products (Processed Retail Products)
export interface FirewoodProduct {
  id: number;
  species: string;
  length: string;
  package_size: string;
  item_full_name: string;
  item_name: string;
  split_size: string;
  product_type: string;
  minimum_quantity: number;
  image_reference?: string;
}

// Define types for Processing Records
export interface ProcessingRecord {
  id: string;
  wood_product_id: string;
  firewood_product_id: number;
  wholesale_pallets_used: number;
  retail_packages_created: number;
  actual_conversion_ratio: number;
  processed_date: string;
  processed_by: string;
  expected_ratio?: number;
  notes?: string;
}

// Table names in Supabase as literal strings
export enum supabaseTable {
  firewood_products = "firewood_products",
  product_pricing = "product_pricing",
  profiles = "profiles",
  wholesale_order_options = "wholesale_order_options",
  wholesale_order_templates = "wholesale_order_templates",
  wholesale_orders = "wholesale_orders",
  wood_products = "wood_products",
  inventory_items = "inventory_items",
  retail_inventory = "retail_inventory",
  processing_records = "processing_records"
}

// Supabase functions
export enum supabaseFunction {
  saveWholesaleOrder = "save-wholesale-order",
  sendWholesaleOrderKlaviyo = "send-wholesale-order-klaviyo",
  decrement_inventory = "decrement-inventory"
}

// Utility function for safer Supabase queries
export function supabaseSafeFrom<T>(
  client: SupabaseClient,
  table: string
) {
  return client.from(table);
}

// Utility function for safer Supabase RPC calls
export function supabaseSafeRpc<T>(
  client: SupabaseClient,
  procedure: string,
  params?: Record<string, any>
) {
  return client.rpc(procedure, params);
}

// Helper function to generate an empty OrderItem with a unique ID
export const generateEmptyOrderItem = (): OrderItem => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  return {
    id: uniqueId,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets",
    pallets: 0,
    unitCost: 250
  };
};
