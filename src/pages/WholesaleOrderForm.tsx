
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem } from "./wholesale-order/types";
import { useToast } from "@/hooks/use-toast";

interface WholesaleOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string;
  items: OrderItem[];
}

export function WholesaleOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleSubmit = async () => {
    try {
      if (!orderData) return;

      const { error } = await supabase
        .from('wholesale_orders')
        .update({
          items: orderData.items,
          delivery_date: orderData.delivery_date,
          order_date: orderData.order_date
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      navigate('/wholesale-orders');
    } catch (err) {
      console.error('Error updating order:', err);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

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

  // Calculate summary information
  const summaryInfo = orderData.items.reduce((acc, item) => {
    const totalCost = (item.pallets || 0) * (item.unitCost || 0);
    return {
      totalPallets: acc.totalPallets + (item.pallets || 0),
      totalCost: acc.totalCost + totalCost,
      totalItems: acc.totalItems + 1
    };
  }, { totalPallets: 0, totalCost: 0, totalItems: 0 });

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
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Order #{orderData.order_number}</CardTitle>
              <Button 
                onClick={handleSubmit}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                Update Order
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Order Date: {formatDate(orderData.order_date)}
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
                        <td className="py-2">${((item.pallets || 0) * (item.unitCost || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary Section */}
              <div className="mt-8 border-t pt-6">
                <div className="bg-[#f3f3f3] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#222222] mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Item Types</span>
                      <span className="font-medium text-[#333333]">{summaryInfo.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Total Pallets</span>
                      <span className="font-medium text-[#333333]">{summaryInfo.totalPallets}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-[#1A1F2C]">Total Order Value</span>
                      <span className="font-bold text-[#1A1F2C]">
                        ${summaryInfo.totalCost.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
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
