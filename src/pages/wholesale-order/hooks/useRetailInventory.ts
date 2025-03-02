
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RetailInventoryItem, FirewoodProduct, ProcessingRecord } from "../types";

export function useRetailInventory() {
  const [retailInventory, setRetailInventory] = useState<RetailInventoryItem[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<FirewoodProduct[]>([]);
  const [processingHistory, setProcessingHistory] = useState<ProcessingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRetailInventory = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch retail inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("retail_inventory")
        .select("*")
        .order('last_updated', { ascending: false });

      if (inventoryError) {
        console.error("Error fetching retail inventory:", inventoryError);
        return;
      }
      
      // Fetch firewood products
      const { data: productsData, error: productsError } = await supabase
        .from("firewood_products")
        .select("*");

      if (productsError) {
        console.error("Error fetching firewood products:", productsError);
        return;
      }
      
      // Fetch processing history
      const { data: historyData, error: historyError } = await supabase
        .from("processing_records")
        .select("*")
        .order('processed_date', { ascending: false })
        .limit(50); // Limit to recent records

      if (historyError) {
        console.error("Error fetching processing history:", historyError);
        return;
      }
      
      // Cast the data to the correct types
      setRetailInventory(inventoryData as RetailInventoryItem[] || []);
      setFirewoodProducts(productsData as FirewoodProduct[] || []);
      setProcessingHistory(historyData as ProcessingRecord[] || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Allocate retail inventory for an order
  const allocateInventory = useCallback(async (
    firewoodProductId: number, 
    quantity: number
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const { data: inventory, error } = await supabase
        .from('retail_inventory')
        .select('*')
        .eq('firewood_product_id', firewoodProductId)
        .single();
      
      if (error) {
        console.error("Error fetching inventory for allocation:", error);
        return { success: false, error };
      }
      
      const typedInventory = inventory as RetailInventoryItem;
      
      if (!typedInventory || typedInventory.packages_available < quantity) {
        return { 
          success: false, 
          error: `Not enough inventory available. Requested: ${quantity}, Available: ${typedInventory?.packages_available || 0}` 
        };
      }
      
      const { error: updateError } = await supabase
        .from('retail_inventory')
        .update({ 
          packages_available: typedInventory.packages_available - quantity,
          packages_allocated: typedInventory.packages_allocated + quantity,
          last_updated: new Date().toISOString()
        })
        .eq('firewood_product_id', firewoodProductId);
      
      if (updateError) {
        console.error("Error allocating inventory:", updateError);
        return { success: false, error: updateError };
      }
      
      // Refresh inventory data
      fetchRetailInventory();
      
      return { success: true };
    } catch (err) {
      console.error("Error in allocateInventory:", err);
      return { success: false, error: err };
    }
  }, [fetchRetailInventory]);

  // Deallocate retail inventory (e.g., if an order is cancelled)
  const deallocateInventory = useCallback(async (
    firewoodProductId: number, 
    quantity: number
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const { data: inventory, error } = await supabase
        .from('retail_inventory')
        .select('*')
        .eq('firewood_product_id', firewoodProductId)
        .single();
      
      if (error) {
        console.error("Error fetching inventory for deallocation:", error);
        return { success: false, error };
      }
      
      const typedInventory = inventory as RetailInventoryItem;
      
      if (!typedInventory || typedInventory.packages_allocated < quantity) {
        return { 
          success: false, 
          error: `Cannot deallocate more than allocated. Requested: ${quantity}, Allocated: ${typedInventory?.packages_allocated || 0}` 
        };
      }
      
      const { error: updateError } = await supabase
        .from('retail_inventory')
        .update({ 
          packages_available: typedInventory.packages_available + quantity,
          packages_allocated: typedInventory.packages_allocated - quantity,
          last_updated: new Date().toISOString()
        })
        .eq('firewood_product_id', firewoodProductId);
      
      if (updateError) {
        console.error("Error deallocating inventory:", updateError);
        return { success: false, error: updateError };
      }
      
      // Refresh inventory data
      fetchRetailInventory();
      
      return { success: true };
    } catch (err) {
      console.error("Error in deallocateInventory:", err);
      return { success: false, error: err };
    }
  }, [fetchRetailInventory]);

  // Manually adjust inventory levels (for admin use)
  const adjustInventory = useCallback(async (
    firewoodProductId: number,
    adjustment: Partial<RetailInventoryItem>
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const { error } = await supabase
        .from('retail_inventory')
        .update({ 
          ...adjustment,
          last_updated: new Date().toISOString()
        })
        .eq('firewood_product_id', firewoodProductId);
      
      if (error) {
        console.error("Error adjusting inventory:", error);
        return { success: false, error };
      }
      
      // Refresh inventory data
      fetchRetailInventory();
      
      return { success: true };
    } catch (err) {
      console.error("Error in adjustInventory:", err);
      return { success: false, error: err };
    }
  }, [fetchRetailInventory]);

  // Get firewood product details
  const getFirewoodProduct = useCallback((firewoodProductId: number): FirewoodProduct | undefined => {
    return firewoodProducts.find(product => product.id === firewoodProductId);
  }, [firewoodProducts]);

  // Get inventory with product details
  const getInventoryWithProductDetails = useCallback((): (RetailInventoryItem & { product?: FirewoodProduct })[] => {
    return retailInventory.map(item => ({
      ...item,
      product: firewoodProducts.find(product => product.id === item.firewood_product_id)
    }));
  }, [retailInventory, firewoodProducts]);

  useEffect(() => {
    fetchRetailInventory();
  }, [fetchRetailInventory]);

  return {
    retailInventory,
    firewoodProducts,
    processingHistory,
    loading,
    fetchRetailInventory,
    allocateInventory,
    deallocateInventory,
    adjustInventory,
    getFirewoodProduct,
    getInventoryWithProductDetails
  };
}
