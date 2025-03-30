
// Product-related interfaces
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
