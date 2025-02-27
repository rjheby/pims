
import React from "react";
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
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";

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
  const [isSaving, setIsSaving] = useState(false);

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

  const calculateTotalPallets = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  };

  const calculateTotalCost = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  };

  const handleSave = async () => {
    if (!orderData || isSaving) return;

    const totalPallets = calculateTotalPallets();
    
    // Pallet count warnings
    if (totalPallets > 24) {
      toast({
        title: "Warning",
        description: `Order exceeds maximum load by ${totalPallets - 24} pallets. Consider reducing the pallet count.`,
        variant: "destructive",
      });
    } else if (totalPallets < 24) {
      toast({
        title: "Notice",
        description: `Order is not quite full. There's space for ${24 - totalPallets} more pallets.`,
      });
    }

    setIsSaving(true);
    try {
      // Validate order data
      if (!orderData.order_date) {
        throw new Error("Order date is required");
      }

      // Check for valid items
      const validItems = orderData.items.filter(item => 
        item.species && item.length && item.bundleType && item.thickness && Number(item.pallets) > 0
      );
      
      if (validItems.length === 0) {
        throw new Error("At least one valid item is required with all fields filled");
      }

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update({
          order_date: orderData.order_date,
          delivery_date: orderData.delivery_date,
          items: serializeOrderItems(orderData.items)
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Order saved successfully",
      });

      // Redirect after successful save
      navigate('/wholesale-orders');
    } catch (err: any) {
      console.error('Error saving order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save order",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCustomSummary = () => {
    const totalPallets = calculateTotalPallets();
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        {totalPallets < 24 && (
          <div className="text-sm text-amber-600 text-center">
            {24 - totalPallets} pallets remaining before full load
          </div>
        )}
        {totalPallets > 24 && (
          <div className="text-sm text-red-600 text-center">
            Exceeds maximum load by {totalPallets - 24} pallets
          </div>
        )}
        {totalPallets === 24 && (
          <div className="text-sm text-green-600 text-center">
            Perfect load! Exactly 24 pallets.
          </div>
        )}
      </div>
    );
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

  const totalPallets = calculateTotalPallets();
  const totalCost = calculateTotalCost();

  return (
    <div className="flex-1">
      <div>
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

              <BaseOrderSummary 
                items={{
                  totalQuantity: totalPallets,
                  totalValue: totalCost,
                  quantityByPackaging: { 'Pallets': totalPallets }
                }}
                renderCustomSummary={renderCustomSummary}
              />

              <BaseOrderActions 
                onSave={handleSave}
                archiveLink="/wholesale-orders"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
