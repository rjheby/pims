
export interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number | string;
  unitCost: number | string;
  productId?: string; // Reference to wood_products table
}

export interface DropdownOptions {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
}

export const initialOptions: DropdownOptions = {
  species: ["Mixed Hardwood", "Cherry", "Oak", "Hickory", "Ash"],
  length: ["12\"", "16\""],
  bundleType: ["Loose", "Bundled"],
  thickness: ["Standard Split", "Thick Split"],
  packaging: ["Pallets"],
};

// Helper function to serialize OrderItem for Supabase
export const serializeOrderItem = (item: OrderItem): Record<string, string | number> => ({
  id: item.id,
  species: item.species,
  length: item.length,
  bundleType: item.bundleType,
  thickness: item.thickness,
  packaging: item.packaging,
  pallets: item.pallets,
  unitCost: item.unitCost,
  productId: item.productId,
});

// Helper function to serialize OrderItem array for Supabase
export const serializeOrderItems = (items: OrderItem[]): Record<string, string | number>[] => {
  return items.map(serializeOrderItem);
};

// New type for wood products from the database
export interface WoodProduct {
  id: string;
  species: string;
  length: string;
  bundle_type: string;
  thickness: string;
  full_description: string;
  is_popular: boolean;
  popularity_rank: number | null;
  unit_cost: number;
  created_at?: string;
}

// New type for retail firewood products
export interface FirewoodProduct {
  id: number;
  item_name: string;
  item_full_name: string;
  product_type: string;
  species: string;
  length: string;
  split_size: string;
  package_size: string;
  minimum_quantity: number;
  image_reference?: string;
  created_at?: string;
}

// Inventory tracking interface for wholesale products
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

// Retail inventory tracking interface for processed packages
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

// Conversion formula interface for translating between wholesale and retail
export interface ProductConversion {
  id: string;
  wood_product_id: string;
  firewood_product_id: number;
  conversion_ratio: number; // How many retail units come from one wholesale pallet
  last_updated: string;
  adjusted_by?: string; // User who last adjusted the ratio
  notes?: string;
}

// Processing record to track conversion from wholesale to retail
export interface ProcessingRecord {
  id: string;
  wood_product_id: string;
  firewood_product_id: number;
  wholesale_pallets_used: number;
  retail_packages_created: number;
  actual_conversion_ratio: number; // The actual ratio achieved in this processing batch
  processed_date: string;
  processed_by: string;
  expected_ratio?: number; // Optional expected ratio for comparison
  notes?: string;
}

// Helper functions to handle numeric operations safely
export const safeNumber = (value: string | number): number => {
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  return value || 0;
};

export const calculateItemTotal = (pallets: string | number, unitCost: string | number): number => {
  return safeNumber(pallets) * safeNumber(unitCost);
};

// Helper function to convert wholesale inventory to retail units
export const calculateRetailUnits = (
  wholesalePallets: number,
  conversionRatio: number
): number => {
  return Math.floor(wholesalePallets * conversionRatio);
};

// Helper function to calculate how many wholesale pallets needed for retail demand
export const calculateWholesalePalletsNeeded = (
  retailUnits: number,
  conversionRatio: number
): number => {
  return Math.ceil(retailUnits / conversionRatio);
};

// Helper function to update retail inventory after processing wholesale inventory
export const updateRetailInventoryAfterProcessing = (
  retailInventory: RetailInventoryItem,
  newPackages: number
): RetailInventoryItem => {
  return {
    ...retailInventory,
    total_packages: retailInventory.total_packages + newPackages,
    packages_available: retailInventory.packages_available + newPackages,
    last_updated: new Date().toISOString()
  };
};

// Helper function to update wholesale inventory after processing
export const updateWholesaleInventoryAfterProcessing = (
  wholesaleInventory: InventoryItem,
  palletsUsed: number
): InventoryItem => {
  return {
    ...wholesaleInventory,
    pallets_available: Math.max(0, wholesaleInventory.pallets_available - palletsUsed),
    last_updated: new Date().toISOString()
  };
};

// Helper function to calculate actual conversion ratio from a processing batch
export const calculateActualConversionRatio = (
  retailPackagesCreated: number,
  wholesalePalletsUsed: number
): number => {
  if (wholesalePalletsUsed <= 0) return 0;
  return retailPackagesCreated / wholesalePalletsUsed;
};

// Helper to type-safely access Supabase tables
export const supabaseTable = {
  // Original tables
  firewood_products: 'firewood_products',
  product_pricing: 'product_pricing',
  profiles: 'profiles',
  wholesale_order_options: 'wholesale_order_options',
  wholesale_order_templates: 'wholesale_order_templates',
  wholesale_orders: 'wholesale_orders',
  wood_products: 'wood_products',
  
  // New tables
  retail_inventory: 'retail_inventory',
  processing_records: 'processing_records',
  inventory_items: 'inventory_items',
  product_conversions: 'product_conversions'
} as const;

// Type for functions
export const supabaseFunction = {
  is_admin: 'is_admin',
  is_super_admin: 'is_super_admin',
  decrement_inventory: 'decrement_inventory'
} as const;

// Type for Supabase typed tables
export type SupabaseTableType = typeof supabaseTable[keyof typeof supabaseTable];

// Helper function to safely access new tables with type assertion
export const supabaseSafeFrom = (supabase: any, table: string) => {
  return supabase.from(table as any);
};

// Helper function for typed RPC calls
export const supabaseSafeRpc = (supabase: any, fnName: string, params: any) => {
  return supabase.rpc(fnName as any, params);
};
