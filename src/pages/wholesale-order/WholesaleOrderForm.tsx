import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem, safeNumber } from "./types";

interface WholesaleOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date?: string | null;
  items: OrderItem[];
}

// Helper function to calculate pallets from boxes
const calculatePalletsFromBoxes = (boxes: number) => Math.ceil(boxes / 60); // 60 boxes = 1 pallet

export function WholesaleOrderForm() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState<WholesaleOrderData | null>(null);
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

        if (error) {
          throw error;
        }

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

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Order not found</div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate summary information with proper box-to-pallet conversion
  const summaryInfo = orderData.items.reduce((acc, item) => {
    const quantity = safeNumber(item.pallets);
    const totalCost = quantity * safeNumber(item.unitCost);
    
    // Check if item is in boxes or pallets based on packaging field
    const packagingText = (item.packaging || '').toLowerCase();
    const isBoxes = packagingText.includes('box');
    
    // Calculate total actual pallets properly
    const palletEquivalent = isBoxes ? calculatePalletsFromBoxes(quantity) : quantity;
    
    return {
      totalQuantity: acc.totalQuantity + quantity,
      totalPallets: acc.totalPallets + palletEquivalent,
      totalCost: acc.totalCost + totalCost,
      totalItems: acc.totalItems + 1
    };
  }, { totalQuantity: 0, totalPallets: 0, totalCost: 0, totalItems: 0 });

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto px-4">
        <div className="flex justify-center md:justify-start mb-4">
          <img 
            src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
            alt="Woodbourne Logo"
            className="h-8 md:h-12 w-auto"
          />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Wholesale Order #{orderData.order_number}</CardTitle>
            <p className="text-sm text-gray-500">
              Order Date: {formatDate(orderData.order_date)}
              {orderData.delivery_date && ` • Delivery: ${formatDate(orderData.delivery_date)}`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Species</th>
                      <th className="text-left py-2">Length</th>
                      <th className="text-left py-2">Bundle Type</th>
                      <th className="text-left py-2">Thickness</th>
                      <th className="text-left py-2">Packaging</th>
                      <th className="text-left py-2">Quantity</th>
                      <th className="text-left py-2">Unit Cost</th>
                      <th className="text-left py-2">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{item.species}</td>
                        <td className="py-2">{item.length}</td>
                        <td className="py-2">{item.bundleType}</td>
                        <td className="py-2">{item.thickness}</td>
                        <td className="py-2">{item.packaging}</td>
                        <td className="py-2">{item.pallets}</td>
                        <td className="py-2">${item.unitCost}</td>
                        <td className="py-2">${(safeNumber(item.pallets) * safeNumber(item.unitCost)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t mt-6 pt-6">
                <h3 className="text-xl font-semibold mb-6 text-center">Order Summary</h3>
                <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-600 text-lg mb-1">Total Quantity</div>
                    <div className="text-2xl font-semibold">
                      {summaryInfo.totalQuantity}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-lg mb-1">Total Pallets</div>
                    <div className="text-2xl font-semibold">
                      {summaryInfo.totalPallets}
                    </div>
                    {/* Add explanatory note about pallet calculation if boxes are present */}
                    {summaryInfo.totalQuantity !== summaryInfo.totalPallets && (
                      <div className="text-xs text-gray-500 mt-1">
                        (1 pallet = 60 boxes)
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600 text-lg mb-1">Total Order Value</div>
                    <div className="text-2xl font-semibold">
                      ${summaryInfo.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
