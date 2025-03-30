
import { useState, useCallback } from 'react';
import { OrderItem, DropdownOptions } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useOrderValidation } from './useOrderValidation';
import { useOrderOptions } from './useOrderOptions';
import { useOrderStorage } from './useOrderStorage';
import { useOrderDateManagement } from './useOrderDateManagement';

interface UseOrderTableProps {
  initialItems?: OrderItem[];
}

export const useOrderTable = ({ initialItems = [] }: UseOrderTableProps = {}) => {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  
  // Use our smaller focused hooks
  const { options, editingField, editingRowId, newOption, setOptions, 
          setEditingField, setEditingRowId, setNewOption, isLoadingOptions, 
          loadOptions } = useOrderOptions();
          
  const { orderDate, deliveryDate, setOrderDate, setDeliveryDate,
          handleOrderDateChange, handleDeliveryDateChange, 
          generateOrderNumber } = useOrderDateManagement(setOrderNumber);
          
  const { saveOrder, submitOrder } = useOrderStorage({
    items, orderDate, deliveryDate, orderNumber, 
    generateOrderNumber, toast, setIsSubmitting
  });
  
  const { hasValidItems } = useOrderValidation(items);

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
    isSubmitting,
    hasValidItems
  };
};
