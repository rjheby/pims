import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Save, SendHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem, serializeOrderItems, safeNumber } from "./wholesale-order/types";
import { useToast } from "@/hooks/use-toast";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { updateInventoryFromOrder } from "./wholesale-order/utils/inventoryUtils";

interface DatabaseOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string | null;
  items: unknown;
  admin_editable: boolean | null;
  created_at: string | null;
  order_name: string | null;
  status: string | null;
  submitted_at: string | null;
}

interface WholesaleOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string;
  items: OrderItem[];
}

const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export function WholesaleOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [orderData, setOrderData] = useState<WholesaleOrderData | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('draft');
  const [originalSubmittedItems, setOriginalSubmittedItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          const rawData = data as DatabaseOrderData;
          
          console.log('Fetched order data:', rawData);
          
          const parsedItems = typeof rawData.items === 'string' 
            ? JSON.parse(rawData.items) 
            : rawData.items;
          
          const formattedOrderDate = formatDateForInput(rawData.order_date);
          const formattedDeliveryDate = formatDateForInput(rawData.delivery_date);
          
          console.log('Formatted dates:', {
            orderDate: formattedOrderDate,
            deliveryDate: formattedDeliveryDate
          });
          
          setOrderData({
            id: rawData.id,
            order_number: rawData.order_number,
            order_date: formattedOrderDate,
            delivery_date: formattedDeliveryDate,
            items: parsedItems,
          });
          
          if (rawData.status === 'submitted') {
            setOriginalSubmittedItems([...parsedItems]);
          }
          
          if (rawData.status) {
            setOrderStatus(rawData.status);
          }
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
      const newDate = e.target.value;
      console.log('Order date changed to:', newDate);
      setOrderData(prev => ({
        ...prev!,
        order_date: newDate
      }));
    }
  };

  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      const newDate = e.target.value;
      console.log('Delivery date changed to:', newDate);
      setOrderData(prev => ({
        ...prev!,
        delivery_date: newDate
      }));
    }
  };

  const calculateTotalPallets = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  };

  const calculateTotalCost = () => {
    if (!orderData?.items) return 0;
    return orderData.items.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);
  };

  const calculateQuantityBySpecies = () => {
    if (!orderData?.items) return {};
    
    const speciesMap: Record<string, number> = {};
    
    orderData.items.forEach(item => {
      if (item.species && item.pallets) {
        const species = item.species;
        speciesMap[species] = (speciesMap[species] || 0) + safeNumber(item.pallets);
      }
    });
    
    return speciesMap;
  };

  const validateOrder = () => {
    if (!orderData?.order_date) {
      throw new Error("Order date is required");
    }

    const validItems = orderData.items.filter(item => 
      item.species && item.length && item.bundleType && item.thickness && safeNumber(item.pallets) > 0
    );
    
    if (validItems.length === 0) {
      throw new Error("At least one valid item is required with all fields filled");
    }

    return true;
  };

  const handleSave = async () => {
    if (!orderData || isSaving) return;
    
    setIsSaving(true);
    try {
      validateOrder();

      console.log('Saving order with ID:', id);
      console.log('Current order data:', orderData);

      let updateData: Record<string, any> = {
        items: serializeOrderItems(orderData.items),
      };
      
      if (orderStatus === 'submitted') {
        updateData.status = 'submitted';
      } else {
        updateData.status = 'draft';
      }
      
      if (orderData.order_date) {
        updateData.order_date = orderData.order_date;
      }
      
      if (orderData.delivery_date && orderData.delivery_date.trim() !== '') {
        updateData.delivery_date = orderData.delivery_date;
      } else {
        updateData.delivery_date = null;
      }

      console.log('Update data being sent to database:', updateData);

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      const { data: refreshedData, error: refreshError } = await supabase
        .from("wholesale_orders")
        .select("*")
        .eq("id", id)
        .single();

      if (refreshError) {
        console.error("Error refreshing order data:", refreshError);
      } else if (refreshedData) {
        console.log('Refreshed data from server:', refreshedData);
        
        const parsedItems = typeof refreshedData.items === 'string' 
          ? JSON.parse(refreshedData.items) 
          : refreshedData.items;
        
        const formattedOrderDate = formatDateForInput(refreshedData.order_date);
        const formattedDeliveryDate = formatDateForInput(refreshedData.delivery_date);
        
        setOrderData({
          id: refreshedData.id,
          order_number: refreshedData.order_number,
          order_date: formattedOrderDate,
          delivery_date: formattedDeliveryDate,
          items: parsedItems,
        });
        
        if (refreshedData.status) {
          setOrderStatus(refreshedData.status);
        }
      }

      toast({
        title: "Success",
        description: orderStatus === 'submitted' ? "Submitted order updated successfully" : "Order draft saved successfully",
      });
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
    if (!orderData || isSubmitting) return;

    const totalPallets = calculateTotalPallets();
    
    if (safeNumber(totalPallets) > 24) {
      toast({
        title: "Warning",
        description: `Order exceeds maximum load by ${safeNumber(totalPallets) - 24} pallets. Consider reducing the pallet count.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      validateOrder();

      console.log('Submitting order with ID:', id);
      console.log('Current order data for submission:', orderData);

      const isResubmission = orderStatus === 'submitted';
      
      let updateData: Record<string, any> = {
        items: serializeOrderItems(orderData.items),
        status: 'submitted',
      };
      
      if (!isResubmission) {
        updateData.submitted_at = new Date().toISOString();
      }
      
      if (orderData.order_date) {
        updateData.order_date = orderData.order_date;
      }
      
      if (orderData.delivery_date && orderData.delivery_date.trim() !== '') {
        updateData.delivery_date = orderData.delivery_date;
      } else {
        updateData.delivery_date = null;
      }

      console.log('Update data being sent to database for submission:', updateData);

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Supabase submit error:', updateError);
        throw updateError;
      }

      setOrderStatus('submitted');
      
      if (isResubmission) {
        const itemDifferences = calculateItemDifferences(originalSubmittedItems, orderData.items);
        console.log('Item differences for inventory adjustment:', itemDifferences);
        
        const updateResult = await updateInventoryFromOrder(itemDifferences);
        if (!updateResult.success) {
          console.warn('Inventory adjustment was partial or failed:', updateResult.error);
          toast({
            title: "Order Updated",
            description: "Order resubmitted successfully, but inventory adjustment was incomplete. Please check inventory.",
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: "Order resubmitted successfully and inventory adjusted",
          });
        }
      } else {
        const updateResult = await updateInventoryFromOrder(orderData.items);
        if (!updateResult.success) {
          console.warn('Inventory was updated partially or not at all:', updateResult.error);
          
          toast({
            title: "Order Submitted",
            description: "Order submitted successfully, but inventory update was incomplete. Please check inventory.",
            variant: "default",
          });
        } else {
          toast({
            title: "Success",
            description: "Order submitted successfully and inventory updated",
          });
        }
      }

      navigate('/wholesale-orders');
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

  const calculateItemDifferences = (originalItems: OrderItem[], updatedItems: OrderItem[]): OrderItem[] => {
    const differences: OrderItem[] = [];
    
    updatedItems.forEach(updatedItem => {
      const originalItem = originalItems.find(item => 
        item.species === updatedItem.species && 
        item.length === updatedItem.length && 
        item.bundleType === updatedItem.bundleType && 
        item.thickness === updatedItem.thickness
      );
      
      if (!originalItem) {
        differences.push({...updatedItem});
      } else if (safeNumber(updatedItem.pallets) > safeNumber(originalItem.pallets)) {
        differences.push({
          ...updatedItem,
          pallets: safeNumber(updatedItem.pallets) - safeNumber(originalItem.pallets)
        });
      }
    });
    
    originalItems.forEach(originalItem => {
      const updatedItem = updatedItems.find(item => 
        item.species === originalItem.species && 
        item.length === originalItem.length && 
        item.bundleType === originalItem.bundleType && 
        item.thickness === originalItem.thickness
      );
      
      if (!updatedItem) {
        differences.push({
          ...originalItem,
          pallets: -safeNumber(originalItem.pallets)
        });
      } else if (safeNumber(updatedItem.pallets) < safeNumber(originalItem.pallets)) {
        differences.push({
          ...originalItem,
          pallets: -(safeNumber(originalItem.pallets) - safeNumber(updatedItem.pallets))
        });
      }
    });
    
    return differences;
  };

  const handleOrderItemsChange = (updatedItems: OrderItem[]) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        items: updatedItems
      }));
      
      console.log("Order items updated:", updatedItems);
    }
  };

  const renderCustomSummary = () => {
    const totalPallets = calculateTotalPallets();
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        {safeNumber(totalPallets) < 24 && (
          <div className="text-sm text-amber-600 text-center">
            {24 - safeNumber(totalPallets)} pallets remaining before full load
          </div>
        )}
        {safeNumber(totalPallets) > 24 && (
          <div className="text-sm text-red-600 text-center">
            Exceeds maximum load by {safeNumber(totalPallets) - 24} pallets
          </div>
        )}
        {safeNumber(totalPallets) === 24 && (
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
  const speciesBreakdown = calculateQuantityBySpecies();

  const isSubmitted = orderStatus === 'submitted';
  const actionLabel = isSubmitted ? "Update Submitted Order" : "Submit Order";

  return (
    <div className="flex-1">
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Order #{orderData?.order_number}</CardTitle>
              {isSubmitted && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BaseOrderDetails
                orderNumber={orderData.order_number}
                orderDate={orderData.order_date}
                deliveryDate={orderData.delivery_date}
                onOrderDateChange={handleOrderDateChange}
                onDeliveryDateChange={handleDeliveryDateChange}
                disabled={false}
              />
              
              <WholesaleOrderProvider 
                initialItems={orderData.items}
              >
                <OrderTable 
                  readOnly={false}
                  onItemsChange={handleOrderItemsChange} 
                />
              </WholesaleOrderProvider>

              <BaseOrderSummary 
                items={{
                  totalQuantity: totalPallets,
                  totalValue: totalCost,
                  quantityByPackaging: {
                    'Pallets': totalPallets,
                    ...speciesBreakdown
                  }
                }}
                renderCustomSummary={renderCustomSummary}
              />

              <BaseOrderActions
                onSave={handleSave}
                onSubmit={handleSubmit}
                submitLabel={actionLabel}
                archiveLink="/wholesale-orders"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
