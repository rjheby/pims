
export interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;  // Renamed from cost to unitCost
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
});

// Helper function to serialize OrderItem array for Supabase
export const serializeOrderItems = (items: OrderItem[]): Record<string, string | number>[] => {
  return items.map(serializeOrderItem);
};
