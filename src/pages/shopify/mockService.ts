
import { supabase } from "@/integrations/supabase/client";
import { ShopifyIntegrationSettings, ProductMapping, ShopifyProduct } from "./types";

// These are mock implementations until the actual tables are created in Supabase
export const getShopifySettings = async (): Promise<ShopifyIntegrationSettings | null> => {
  // This would normally query the database, but we'll return mock data instead
  return {
    id: 1,
    shop_domain: "",
    api_key: "",
    api_secret: "",
    is_connected: false,
    auto_sync_enabled: false,
    last_sync_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const saveShopifySettings = async (settings: Partial<ShopifyIntegrationSettings>): Promise<void> => {
  // This would normally save to the database
  console.log("Saving settings:", settings);
};

export const fetchShopifyProductMappings = async (): Promise<ProductMapping[]> => {
  // This would normally fetch from the database
  return [];
};

export const updateProductMapping = async (
  shopifyVariantId: string, 
  firewoodProductId: number | null
): Promise<void> => {
  // This would normally update the database
  console.log("Mapping product:", { shopifyVariantId, firewoodProductId });
};

export const fetchFirewoodProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("firewood_products")
      .select("*")
      .order("item_name");
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error loading firewood products:", error);
    return [];
  }
};

// Mock function to simulate fetching products from Shopify API
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return [
    {
      id: "8025022734553",
      title: "Kiln Dried Hardwood",
      variant_id: "45267072934169",
      variant_title: "1/4 Face Cord",
      inventory_quantity: 25,
      price: "119.00",
      sku: "KD-14FC",
      mapped_to_internal_id: null
    },
    {
      id: "8025022734553",
      title: "Kiln Dried Hardwood",
      variant_id: "45267072966937",
      variant_title: "1/2 Face Cord",
      inventory_quantity: 15,
      price: "219.00",
      sku: "KD-12FC",
      mapped_to_internal_id: null
    },
    {
      id: "8025022767321",
      title: "Seasoned Oak",
      variant_id: "45267073032473",
      variant_title: "1/4 Face Cord",
      inventory_quantity: 18,
      price: "129.00",
      sku: "SO-14FC",
      mapped_to_internal_id: null
    },
    {
      id: "8025022767321",
      title: "Seasoned Oak",
      variant_id: "45267073065241",
      variant_title: "1/2 Face Cord",
      inventory_quantity: 10,
      price: "229.00",
      sku: "SO-12FC",
      mapped_to_internal_id: null
    }
  ];
};
