import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { OrderTable } from "./wholesale-order/OrderTable";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { serializeOrderItems, safeNumber } from "./wholesale-order/types";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

function WholesaleOrderContent() {
  const { 
    orderNumber, 
    orderDate, 
    deliveryDate, 
    handleOrderDateChange,
    setDeliveryDate,
    items,
    generateOrderNumber
  } = useWholesaleOrder();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const headerDetails = [
    orderDate && `Order Date: ${formatDate(orderDate)}`,
    deliveryDate && `Delivery Date: ${formatDate(deliveryDate)}`
  ].filter(Boolean).join(' • ');

  const calculateTotals = () => {
    const quantityByPackaging = items.reduce((acc, item) => {
      const packaging = item.packaging || 'Unspecified';
      acc[packaging] = (acc[packaging] || 0) + safeNumber(item.pallets);
      return acc;
    }, {} as Record<string, number>);

    const totalQuantity = Object.values(quantityByPackaging).reduce((sum, qty) => sum + qty, 0);
    const totalValue = items.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);

    return {
      quantityByPackaging,
      totalQuantity,
      totalValue,
    };
  };

  const validateOrder = () => {
    if (!orderDate) {
      throw new Error("Order date is required");
    }

    const validItems = items.filter(item => 
      item.species && item.length && item.bundleType && item.thickness && safeNumber(item.pallets) > 0
    );
    
    if (validItems.length === 0) {
      throw new Error("At least one valid item is required with all fields filled");
    }

    return true;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      validateOrder();
      
      let currentOrderNumber = orderNumber;
      if (!currentOrderNumber) {
        currentOrderNumber = await generateOrderNumber(orderDate);
      }

      const { data, error } = await supabase
        .from('wholesale_orders')
        .insert({
          order_number: currentOrderNumber,
          order_date: orderDate,
          delivery_date: deliveryDate || null,
          items: JSON.stringify(items),
          status: 'draft'
        })
        .select();

      if (error) throw error;

      toast({
        title: "Order Saved",
        description: "Your order has been saved as a draft"
      });
      
      if (data && data[0]) {
        navigate(`/wholesale-order/${data[0].id}`);
      } else {
        navigate("/wholesale-orders");
      }
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
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      validateOrder();
      
      const totalPallets = calculateTotals().totalQuantity;
      if (totalPallets > 24) {
        toast({
          title: "Warning",
          description: `Order exceeds maximum load by ${totalPallets - 24} pallets. Consider reducing the pallet count.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      let currentOrderNumber = orderNumber;
      if (!currentOrderNumber) {
        currentOrderNumber = await generateOrderNumber(orderDate);
      }

      const { data, error } = await supabase
        .from('wholesale_orders')
        .insert({
          order_number: currentOrderNumber,
          order_date: orderDate,
          delivery_date: deliveryDate || null,
          items: JSON.stringify(items),
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast({
        title: "Order Submitted",
        description: "Your order has been submitted successfully"
      });
      
      navigate("/wholesale-orders");
    } catch (err: any) {
      console.error('Error submitting order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">{orderNumber ? `Supplier Order #${orderNumber}` : 'New Supplier Order'}</CardTitle>
              {headerDetails && (
                <CardDescription className="mt-1 text-sm">
                  {headerDetails}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <BaseOrderDetails 
              orderNumber={orderNumber}
              orderDate={orderDate}
              deliveryDate={deliveryDate}
              onOrderDateChange={handleOrderDateChange}
              onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
            />
            <div className="w-full overflow-x-auto pb-4">
              <OrderTable />
            </div>
            <BaseOrderSummary items={calculateTotals()} />
            <BaseOrderActions 
              onSave={handleSave} 
              onSubmit={handleSubmit}
              archiveLink="/wholesale-orders"
              isSaving={isSaving}
              isSubmitting={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <WholesaleOrderContent />
    </WholesaleOrderProvider>
  );
}
