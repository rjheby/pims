
import { useState, useCallback, useEffect } from 'react';
import { OrderItem, DropdownOptions, WholesaleOrderItem, WholesaleOrder } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

interface UseOrderTableProps {
  initialItems?: OrderItem[];
}

export const useOrderTable = ({ initialItems = [] }: UseOrderTableProps = {}) => {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [options, setOptions] = useState<DropdownOptions>({
    species: [],
    length: [],
    bundleType: [],
    thickness: [],
    packaging: []
  });
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const { data, error } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setOptions({
          species: data.species || [],
          length: data.length || [],
          bundleType: data.bundleType || [],
          thickness: data.thickness || [],
          packaging: data.packaging || []
        });
      }
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load options',
        variant: 'destructive'
      });
      // Fallback to default options
      setOptions({
        species: ['Mixed Hardwood', 'Cherry', 'Oak', 'Hickory', 'Ash'],
        length: ['12"', '16"'],
        bundleType: ['Loose', 'Bundled'],
        thickness: ['Standard Split', 'Thick Split'],
        packaging: ['Pallets']
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  const handleUpdateQuantity = useCallback((id: number, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      setItems((prevItems: OrderItem[]) => {
        return prevItems.map(item =>
          item.id === id ? { ...item, quantity } : item
        );
      });
    }
  }, []);

  const handleUpdateItemValue = useCallback((id: number, field: string, value: any) => {
    setItems((prevItems: OrderItem[]) => {
      return prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      );
    });
  }, []);

  const handleOrderDateChange = useCallback((date: string) => {
    setOrderDate(date);
  }, []);

  const handleDeliveryDateChange = useCallback((date: string) => {
    setDeliveryDate(date);
  }, []);

  const generateOrderNumber = useCallback(async (date: string) => {
    if (!date) return '';
    
    const shortDate = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `${shortDate}-${random.toString().padStart(3, '0')}`;
    setOrderNumber(orderNumber);
    return orderNumber;
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (orderDate && !orderNumber) {
      generateOrderNumber(orderDate);
    }
  }, [orderDate, orderNumber, generateOrderNumber]);

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
        quantity: item.quantity
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
  }, [items, orderDate, deliveryDate, orderNumber, generateOrderNumber, toast]);

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
        quantity: item.quantity
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
    items,
    setItems,
    options,
    setOptions,
    editingField,
    setEditingField,
    editingRowId,
    setEditingRowId,
    newOption,
    setNewOption,
    orderNumber,
    setOrderNumber,
    orderDate,
    setOrderDate,
    deliveryDate,
    setDeliveryDate,
    isLoadingOptions,
    loadOptions,
    handleUpdateQuantity,
    handleUpdateItemValue,
    handleOrderDateChange,
    handleDeliveryDateChange,
    generateOrderNumber,
    submitOrder,
    saveOrder,
    isSubmitting
  };
};
