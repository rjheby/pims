
export interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;
  highlight?: boolean;
}

export type DropdownOptions = {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
};

export const initialOptions: DropdownOptions = {
  species: ["Oak", "Walnut", "Cherry", "Maple", "Pine"],
  length: ["8'", "10'", "12'", "16'"],
  bundleType: ["Rough Sawn", "Planed", "S4S", "Veneer"],
  thickness: ['4/4', '5/4', '6/4', '8/4', '12/4'],
  packaging: ["Pallets", "Bundles", "Crates", "Loose"]
};

export function serializeOrderItems(items: OrderItem[]): string {
  try {
    // Filter out any highlight property before serializing
    const cleanedItems = items.map(({ highlight, ...item }) => item);
    return JSON.stringify(cleanedItems);
  } catch (error) {
    console.error("Error serializing order items:", error);
    return "[]";
  }
}
