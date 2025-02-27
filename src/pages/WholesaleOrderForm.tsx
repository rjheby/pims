import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem, serializeOrderItems } from "./wholesale-order/types";
import { useToast } from "@/hooks/use-toast";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";

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
          const parsedItems = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
          
          setOrderData({
            id: data.id,
            order_number: data.order_number,
            order_date: data.order_date,
            delivery_date: data.delivery_date,
            items: parsedItems
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

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        order_date: e.target.value
      }));
    }
  };

  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        delivery_date: e.target.value
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!orderData) return;

      const { error } = await supabase
        .from('wholesale_orders')
        .update({
          order_date: orderData.order_date,
          delivery_date: orderData.delivery_date,
          items: serializeOrderItems(orderData.items)
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (!orderData) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-500">Order not found</div>
    </div>
  );

  return (
    <div className="flex-1">
      <div>
        <div className="flex justify-center md:justify-start mb-4">
          <img 
            src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
            alt="Woodbourne Logo"
            className="h-8 md:h-12 w-auto"
          />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Supplier Order #{orderData?.order_number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BaseOrderDetails
                orderNumber={orderData.order_number}
                orderDate={orderData.order_date}
                deliveryDate={orderData.delivery_date}
                onOrderDateChange={handleOrderDateChange}
                onDeliveryDateChange={handleDeliveryDateChange}
              />
              
              <WholesaleOrderProvider initialItems={orderData.items}>
                <OrderTable />
              </WholesaleOrderProvider>

              <BaseOrderActions 
                onSave={handleSubmit}
                archiveLink="/wholesale-orders"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
