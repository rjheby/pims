
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem } from "./types";

interface OrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string;
  items: OrderItem[];
}

export function OrderView() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderData() {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setOrderData({
            ...data,
            items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
          });
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOrderData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Order not found'}</div>
      </div>
    );
  }

  const totalPallets = orderData.items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const totalValue = orderData.items.reduce((sum, item) => sum + ((item.pallets || 0) * (item.unitCost || 0)), 0);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center md:justify-start mb-4">
        <img 
          src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
          alt="Woodbourne Logo"
          className="h-8 md:h-12 w-auto"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Supplier Order #{orderData.order_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-500">Order Date</label>
                <div className="mt-1">{new Date(orderData.order_date).toLocaleDateString()}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Date</label>
                <div className="mt-1">{new Date(orderData.delivery_date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bundle Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thickness</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packaging</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pallets</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orderData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.species}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.bundleType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.thickness}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.packaging}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.pallets}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${item.unitCost?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${((item.pallets || 0) * (item.unitCost || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4 text-right font-medium">Totals:</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{totalPallets}</td>
                    <td className="px-6 py-4 whitespace-nowrap"></td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">${totalValue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
