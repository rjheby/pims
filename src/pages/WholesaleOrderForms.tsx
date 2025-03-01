
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function WholesaleOrderForms() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("wholesale_orders")
        .select("id, order_number, created_at");

      if (error) {
        console.error("Error fetching wholesale orders:", error);
      } else {
        setOrders(data);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Wholesale Order Forms</h1>
      <ul className="border rounded-lg p-4 bg-white shadow-sm">
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order.id} className="py-2 border-b last:border-none">
              <Link to={`/wholesale-order-form/${order.id}`} className="text-blue-600 hover:underline">
                {order.order_number} - {new Date(order.created_at).toLocaleDateString()}
              </Link>
            </li>
          ))
        ) : (
          <p>No wholesale orders have been generated yet.</p>
        )}
      </ul>
    </div>
  );
}
