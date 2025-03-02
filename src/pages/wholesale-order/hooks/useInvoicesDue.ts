
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, isAfter } from "date-fns";

export function useInvoicesDue() {
  const [invoicesDue, setInvoicesDue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoicesDue = async () => {
      try {
        setLoading(true);
        
        // Get today's date at the start of the day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate the date 45 days ago
        const daysAgo45 = addDays(today, -45);
        
        // Calculate tomorrow (more than 1 day ahead requirement)
        const tomorrow = addDays(today, 1);
        
        // Fetch submitted wholesale orders
        const { data: orders, error } = await supabase
          .from("wholesale_orders")
          .select("delivery_date, items")
          .not("submitted_at", "is", null)
          .not("delivery_date", "is", null);

        if (error) {
          console.error("Error fetching invoices due:", error);
          return;
        }

        // Filter orders where delivery date is less than 45 days ago and more than 1 day ahead
        const filteredOrders = orders.filter(order => {
          if (!order.delivery_date) return false;
          
          const deliveryDate = new Date(order.delivery_date);
          
          // Check if delivery date is less than 45 days ago AND not in the future beyond tomorrow
          return isAfter(deliveryDate, daysAgo45) && isBefore(deliveryDate, tomorrow);
        });

        // Calculate total cost for filtered orders
        const totalDue = filteredOrders.reduce((sum, order) => {
          const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          
          const orderTotal = items.reduce((orderSum: number, item: any) => {
            return orderSum + (Number(item.pallets) || 0) * (Number(item.unitCost) || 0);
          }, 0);
          
          return sum + orderTotal;
        }, 0);

        setInvoicesDue(totalDue);
      } catch (err) {
        console.error("Error calculating invoices due:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesDue();
  }, []);

  return { invoicesDue, loading };
}
