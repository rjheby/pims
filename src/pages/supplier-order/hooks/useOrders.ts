
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("id, order_number, order_date, delivery_date, items")
          .order('delivery_date', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          const processedOrders = (data || []).map((order: any) => ({
            ...order,
            formattedDeliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set',
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
            totalPallets: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
              .reduce((sum: number, item: any) => sum + (Number(item.pallets) || 0), 0),
            totalValue: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
              .reduce((sum: number, item: any) => sum + (Number(item.pallets) || 0) * (Number(item.unitCost) || 0), 0)
          }));
          setOrders(processedOrders);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return { orders, loading };
}
