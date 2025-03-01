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
