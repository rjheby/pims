
// Empty options object for initial state
export const emptyOptions = {
  species: ["Pine", "Spruce", "Fir"],
  length: ["8'", "10'", "12'"],
  bundleType: ["2x4", "2x6", "2x8"],
  thickness: ["KD", "Green"],
  packaging: ["Pallets", "Bunks", "Banded"]
};

// Initial options with some default values for fallback
export const initialOptions = {
  species: [],
  length: [],
  bundleType: [],
  thickness: [],
  packaging: ["Pallets", "Crates", "Boxes", "12x10\" Boxes"]
};

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
