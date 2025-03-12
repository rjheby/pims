
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrderItem, serializeOrderItems, safeNumber } from "../types";
import { updateInventoryFromOrder } from "../utils/inventoryUtils";

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

export interface WholesaleOrderData {
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

export function useWholesaleOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
          
          const parsedItems = typeof rawData.items === 'string' 
            ? JSON.parse(rawData.items) 
            : rawData.items;
          
          const formattedOrderDate = formatDateForInput(rawData.order_date);
          const formattedDeliveryDate = formatDateForInput(rawData.delivery_date);
          
          setOrderData({
            id: rawData.id,
            order_number: rawData.order_number,
            order_date: formattedOrderDate,
            delivery_date: formattedDeliveryDate,
            items: parsedItems,
          });
          
          if (rawData.status === 'submitted') {
            setOriginalSubmittedItems([...parsedItems]);
            setOrderStatus('submitted');
          } else {
            setOrderStatus(rawData.status || 'draft');
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
      setOrderData(prev => ({
        ...prev!,
        order_date: newDate
      }));
    }
  };

  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      const newDate = e.target.value;
      setOrderData(prev => ({
        ...prev!,
        delivery_date: newDate
      }));
    }
  };

  const handleOrderItemsChange = (updatedItems: OrderItem[]) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        items: updatedItems
      }));
    }
  };

  const handleSave = async () => {
    if (!orderData || isSaving) return;
    
    setIsSaving(true);
    try {
      console.log('Saving order with ID:', id);

      let updateData: Record<string, any> = {
        items: serializeOrderItems(orderData.items),
        status: 'draft'
      };
      
      if (orderData.order_date) {
        updateData.order_date = orderData.order_date;
      }
      
      if (orderData.delivery_date && orderData.delivery_date.trim() !== '') {
        updateData.delivery_date = orderData.delivery_date;
      } else {
        updateData.delivery_date = null;
      }

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Order draft saved successfully",
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
    
    setIsSubmitting(true);
    try {
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

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setOrderStatus('submitted');
      
      if (isResubmission) {
        const itemDifferences = calculateItemDifferences(originalSubmittedItems, orderData.items);
        const updateResult = await updateInventoryFromOrder(itemDifferences);
        if (!updateResult.success) {
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

  return {
    orderData,
    orderStatus,
    loading,
    error,
    isSaving,
    isSubmitting,
    handleOrderDateChange,
    handleDeliveryDateChange,
    handleOrderItemsChange,
    handleSave,
    handleSubmit
  };
}

function calculateItemDifferences(originalItems: OrderItem[], updatedItems: OrderItem[]): OrderItem[] {
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
}
