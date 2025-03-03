
import { SupabaseClient } from "@supabase/supabase-js";

// Define types for Wholesale Order Form
export interface WholesaleOrderItem {
  wood_product_id: string;
  product_description: string;
  unitCost: number;
  pallets: number;
}

export interface WholesaleOrder {
  id?: string;
  customer_id: string;
  order_date: string;
  delivery_date: string;
  items: WholesaleOrderItem[];
  notes?: string;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
}

// OrderTable dropdown options
export interface DropdownOptions {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
}

// Initial dropdown options
export const initialOptions: DropdownOptions = {
  species: ["Pine", "Oak", "Maple", "Cherry", "Mixed Hardwood"],
  length: ["16\"", "18\"", "24\"", "36\"", "48\""],
  bundleType: ["Standard", "Premium", "Loose"],
  thickness: ["1\"", "2\"", "3\"", "4\""],
  packaging: ["Pallets", "Crates", "Boxes"]
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

// Define types for Wood Products
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

// Define types for Firewood Products
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

// Table names in Supabase
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
  sendWholesaleOrderKlaviyo = "send-wholesale-order-klaviyo"
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
