
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function OrderView() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Order not found</div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotals = () => {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    return items.reduce((acc: any, item: any) => ({
      totalPallets: acc.totalPallets + (item.pallets || 0),
      totalValue: acc.totalValue + ((item.pallets || 0) * (item.unitCost || 0))
    }), { totalPallets: 0, totalValue: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <img src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png" alt="Logo" className="h-12 w-auto" />
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-2">Supplier Order #{order.order_number}</h1>
        <div className="text-center text-gray-600">
          <div>Order Date: {formatDate(order.order_date)}</div>
          {order.delivery_date && <div>Delivery Date: {formatDate(order.delivery_date)}</div>}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Species</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Length</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bundle Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thickness</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Packaging</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Unit Cost</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(typeof order.items === 'string' ? JSON.parse(order.items) : order.items).map((item: any, index: number) => (
              <tr key={index} className="bg-white">
                <td className="px-4 py-3 text-sm text-gray-900">{item.species}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.length}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.bundleType}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.thickness}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.packaging}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.pallets}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitCost}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  ${((item.pallets || 0) * (item.unitCost || 0)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pallets</span>
              <span className="font-medium">{totals.totalPallets}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Order Value</span>
              <span>${totals.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
