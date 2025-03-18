
export interface ShopifyIntegrationSettings {
  id: number;
  shop_domain: string;
  api_key: string;
  api_secret: string;
  is_connected: boolean;
  auto_sync_enabled: boolean;
  last_sync_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  variant_id: string;
  variant_title: string;
  inventory_quantity: number;
  price: string;
  sku: string;
  mapped_to_internal_id: string | null;
}

export interface ProductMapping {
  id: string;
  shopify_product_id: string;
  shopify_variant_id: string;
  firewood_product_id: number;
  created_at?: string;
}
