
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeNumber } from "../types";

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { 
    orders, 
    loading, 
    refreshOrders: fetchOrders,
    calculateInventoryImpact 
  };
}
