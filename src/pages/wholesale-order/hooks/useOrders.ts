
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeNumber, ProcessingRecord, RetailInventoryItem, InventoryItem } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wholesale_orders")
        .select("id, order_number, order_date, delivery_date, items, status, submitted_at")
        .order('order_number', { ascending: false }); // Z to A sorting

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      const processedOrders = (data || []).map((order: any) => ({
        ...order,
        formattedDeliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set',
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
        totalPallets: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
          .reduce((sum: number, item: any) => sum + safeNumber(item.pallets), 0),
        totalValue: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
          .reduce((sum: number, item: any) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0)
      }));
      
      setOrders(processedOrders);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate inventory impact from an order
  const calculateInventoryImpact = useCallback((orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return null;
    
    // Group by product ID to summarize quantity changes
    const productImpact: Record<string, number> = {};
    
    // For submitted wholesale orders, we're adding to inventory
    if (order.status === 'submitted') {
      order.items.forEach((item: any) => {
        if (item.productId) {
          productImpact[item.productId] = (productImpact[item.productId] || 0) + safeNumber(item.pallets);
        }
      });
    }
    
    return {
      orderId: order.id,
      orderNumber: order.order_number,
      orderDate: order.order_date,
      productImpact
    };
  }, [orders]);

  // Record a processing batch that converts wholesale to retail inventory
  const recordProcessingBatch = useCallback(async (
    processingRecord: Omit<ProcessingRecord, 'id' | 'actual_conversion_ratio'>
  ) => {
    try {
      // Calculate the actual conversion ratio
      const actualRatio = processingRecord.retail_packages_created / processingRecord.wholesale_pallets_used;
      
      // Insert the processing record
      const { data, error } = await supabase
        .from('processing_records')
        .insert([{ 
          ...processingRecord,
          actual_conversion_ratio: actualRatio,
          processed_date: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        console.error("Error recording processing batch:", error);
        return { success: false, error };
      }
      
      // Update the wholesale inventory
      const { error: wholesaleError } = await supabase
        .from('inventory_items')
        .update({ 
          pallets_available: supabase.rpc('decrement_inventory', { 
            product_id: processingRecord.wood_product_id,
            amount: processingRecord.wholesale_pallets_used
          }),
          last_updated: new Date().toISOString()
        })
        .eq('wood_product_id', processingRecord.wood_product_id);
      
      if (wholesaleError) {
        console.error("Error updating wholesale inventory:", wholesaleError);
        return { success: false, error: wholesaleError };
      }
      
      // Update or insert retail inventory
      const { data: retailInventory, error: retailError } = await supabase
        .from('retail_inventory')
        .select('*')
        .eq('firewood_product_id', processingRecord.firewood_product_id)
        .single();
      
      if (retailError && retailError.code !== 'PGRST116') { // PGRST116 is "no rows returned" 
        console.error("Error checking retail inventory:", retailError);
        return { success: false, error: retailError };
      }
      
      if (retailInventory) {
        // Update existing retail inventory
        const typedRetailInventory = retailInventory as RetailInventoryItem;
        const { error: updateError } = await supabase
          .from('retail_inventory')
          .update({ 
            total_packages: typedRetailInventory.total_packages + processingRecord.retail_packages_created,
            packages_available: typedRetailInventory.packages_available + processingRecord.retail_packages_created,
            last_updated: new Date().toISOString()
          })
          .eq('firewood_product_id', processingRecord.firewood_product_id);
        
        if (updateError) {
          console.error("Error updating retail inventory:", updateError);
          return { success: false, error: updateError };
        }
      } else {
        // Create new retail inventory record
        const { error: retailInsertError } = await supabase
          .from('retail_inventory')
          .insert([{
            firewood_product_id: processingRecord.firewood_product_id,
            total_packages: processingRecord.retail_packages_created,
            packages_available: processingRecord.retail_packages_created,
            packages_allocated: 0,
            last_updated: new Date().toISOString()
          }]);
        
        if (retailInsertError) {
          console.error("Error creating retail inventory:", retailInsertError);
          return { success: false, error: retailInsertError };
        }
      }
      
      // Check if we need to update the conversion ratio based on actual results
      if (Math.abs(actualRatio - processingRecord.expected_ratio) > 0.1) {
        // The actual ratio differs significantly from expected, consider updating
        const { error: conversionError } = await supabase
          .from('product_conversions')
          .update({ 
            conversion_ratio: actualRatio,
            last_updated: new Date().toISOString(),
            adjusted_by: processingRecord.processed_by,
            notes: `Automatically adjusted based on processing batch on ${new Date().toLocaleDateString()}`
          })
          .eq('wood_product_id', processingRecord.wood_product_id)
          .eq('firewood_product_id', processingRecord.firewood_product_id);
        
        if (conversionError) {
          console.error("Error updating conversion ratio:", conversionError);
          // Non-critical error, we'll still consider the operation successful
        }
      }
      
      return { success: true, data };
    } catch (err) {
      console.error("Error in recordProcessingBatch:", err);
      return { success: false, error: err };
    }
  }, []);

  // Get retail inventory status for a specific firewood product
  const getRetailInventory = useCallback(async (firewoodProductId: number): Promise<RetailInventoryItem | null> => {
    try {
      const { data, error } = await supabase
        .from('retail_inventory')
        .select('*')
        .eq('firewood_product_id', firewoodProductId)
        .single();
      
      if (error) {
        console.error("Error fetching retail inventory:", error);
        return null;
      }
      
      return data as RetailInventoryItem;
    } catch (err) {
      console.error("Error in getRetailInventory:", err);
      return null;
    }
  }, []);

  // Get wholesale inventory status for a specific wood product
  const getWholesaleInventory = useCallback(async (woodProductId: string): Promise<InventoryItem | null> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('wood_product_id', woodProductId)
        .single();
      
      if (error) {
        console.error("Error fetching wholesale inventory:", error);
        return null;
      }
      
      return data as InventoryItem;
    } catch (err) {
      console.error("Error in getWholesaleInventory:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { 
    orders, 
    loading, 
    refreshOrders: fetchOrders,
    calculateInventoryImpact,
    recordProcessingBatch,
    getRetailInventory,
    getWholesaleInventory
  };
}
