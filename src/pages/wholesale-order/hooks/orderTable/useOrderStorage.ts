
import { useCallback } from 'react';
import { OrderItem, WholesaleOrderItem, WholesaleOrder } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface UseOrderStorageProps {
  items: OrderItem[];
  orderDate: string;
  deliveryDate: string;
  orderNumber: string;
  generateOrderNumber: (date: string) => Promise<string>;
  toast: any; // Using any here for brevity
  setIsSubmitting: (value: boolean) => void;
}

export function useOrderStorage({
  items,
  orderDate,
  deliveryDate,
  orderNumber,
  generateOrderNumber,
  toast,
  setIsSubmitting
}: UseOrderStorageProps) {
  
  const submitOrder = useCallback(async (): Promise<boolean> => {
    if (items.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one item to the order',
        variant: 'destructive'
      });
      return false;
    }

    if (!orderDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an order date',
        variant: 'destructive'
      });
      return false;
    }

    // Check if all required fields are filled
    const invalidItems = items.filter(
      item => !item.species || !item.length || !item.bundleType || !item.thickness || !item.packaging
    );

    if (invalidItems.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all item details',
        variant: 'destructive'
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      // Generate order number if not already set
      let finalOrderNumber = orderNumber;
      if (!finalOrderNumber) {
        finalOrderNumber = await generateOrderNumber(orderDate);
      }

      // Convert OrderItem[] to WholesaleOrderItem[]
      const formattedItems: WholesaleOrderItem[] = items.map(item => ({
        id: uuidv4(),
        species: item.species,
        length: item.length,
        bundleType: item.bundleType,
        thickness: item.thickness,
        packaging: item.packaging,
        pallets: item.pallets,
        unitCost: item.unitCost
      }));

      // Create order in database
      const order: WholesaleOrder = {
        id: uuidv4(),
        order_number: finalOrderNumber,
        order_date: new Date(orderDate).toISOString(),
        delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null,
        items: formattedItems,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase.from('wholesale_orders').insert(order);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Order submitted successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: `Failed to submit order: ${error.message}`,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [items, orderDate, deliveryDate, orderNumber, generateOrderNumber, toast, setIsSubmitting]);

  const saveOrder = useCallback(async (): Promise<string | null> => {
    if (items.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one item to the order',
        variant: 'destructive'
      });
      return null;
    }

    if (!orderDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select an order date',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Generate order number if not already set
      let finalOrderNumber = orderNumber;
      if (!finalOrderNumber) {
        finalOrderNumber = await generateOrderNumber(orderDate);
      }

      // Convert OrderItem[] to WholesaleOrderItem[]
      const formattedItems: WholesaleOrderItem[] = items.map(item => ({
        id: uuidv4(),
        species: item.species,
        length: item.length,
        bundleType: item.bundleType,
        thickness: item.thickness,
        packaging: item.packaging,
        pallets: item.pallets,
        unitCost: item.unitCost
      }));

      // Create order in database
      const orderId = uuidv4();
      const order: WholesaleOrder = {
        id: orderId,
        order_number: finalOrderNumber,
        order_date: new Date(orderDate).toISOString(),
        delivery_date: deliveryDate ? new Date(deliveryDate).toISOString() : null,
        items: formattedItems,
        status: 'draft'
      };

      const { error } = await supabase.from('wholesale_orders').insert(order);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Order saved successfully'
      });

      return orderId;
    } catch (error: any) {
      console.error('Error saving order:', error);
      toast({
        title: 'Error',
        description: `Failed to save order: ${error.message}`,
        variant: 'destructive'
      });
      return null;
    }
  }, [items, orderDate, deliveryDate, orderNumber, generateOrderNumber, toast]);

  return {
    submitOrder,
    saveOrder
  };
}
