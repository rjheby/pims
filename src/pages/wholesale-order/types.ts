import { SupabaseClient, PostgrestFilterBuilder } from "@supabase/supabase-js";

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

// Define types for Wood Products
export interface WoodProduct {
  id: string;
  species: string;
  length: string;
  thickness: string;
  full_description: string;
}

// Define types for Inventory Items
export interface InventoryItem {
  id: string;
  wood_product_id: string;
  total_pallets: number;
  pallets_available: number;
  pallets_allocated: number;
  last_updated: string;
}

// Define types for Retail Inventory
export interface RetailInventoryItem {
  id: string;
  firewood_product_id: number;
  total_packages: number;
  packages_available: number;
  packages_allocated: number;
  last_updated: string;
}

// Define types for Firewood Products
export interface FirewoodProduct {
  id: number;
  species: string;
  length: string;
  package_size: string;
  item_full_name: string;
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
  notes: string;
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

// Utility function for safer Supabase queries
export function supabaseSafeFrom<T>(
  client: SupabaseClient,
  table: supabaseTable
) {
  return client.from(table) as unknown as PostgrestFilterBuilder<T>;
}
