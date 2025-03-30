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
