
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  InventoryItem, 
  WoodProduct,
  supabaseTable
} from "../types";

export function useWholesaleInventory() {
  const [wholesaleInventory, setWholesaleInventory] = useState<InventoryItem[]>([]);
  const [woodProducts, setWoodProducts] = useState<WoodProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWholesaleInventory = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch wholesale inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from(supabaseTable.inventory_items)
        .select("*")
        .order('last_updated', { ascending: false });

      if (inventoryError) {
        console.error("Error fetching wholesale inventory:", inventoryError);
        return;
      }
      
      // Fetch wood products
      const { data: productsData, error: productsError } = await supabase
        .from(supabaseTable.wood_products)
        .select("*");

      if (productsError) {
        console.error("Error fetching wood products:", productsError);
        return;
      }
      
      // Cast the data to the correct types
      setWholesaleInventory(inventoryData as InventoryItem[] || []);
      setWoodProducts(productsData as WoodProduct[] || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adjust wholesale inventory levels (for admin use)
  const adjustInventory = useCallback(async (
    woodProductId: string,
    adjustment: Partial<InventoryItem>
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const { error } = await supabase
        .from(supabaseTable.inventory_items)
        .update({ 
          ...adjustment,
          last_updated: new Date().toISOString()
        })
        .eq('wood_product_id', woodProductId);
      
      if (error) {
        console.error("Error adjusting inventory:", error);
        return { success: false, error };
      }
      
      // Refresh inventory data
      fetchWholesaleInventory();
      
      return { success: true };
    } catch (err) {
      console.error("Error in adjustInventory:", err);
      return { success: false, error: err };
    }
  }, [fetchWholesaleInventory]);

  // Get inventory with product details
  const getInventoryWithProductDetails = useCallback((): (InventoryItem & { product?: WoodProduct })[] => {
    return wholesaleInventory.map(item => ({
      ...item,
      product: woodProducts.find(product => product.id === item.wood_product_id)
    }));
  }, [wholesaleInventory, woodProducts]);

  useEffect(() => {
    fetchWholesaleInventory();
  }, [fetchWholesaleInventory]);

  return {
    wholesaleInventory,
    woodProducts,
    loading,
    fetchWholesaleInventory,
    adjustInventory,
    getInventoryWithProductDetails
  };
}
