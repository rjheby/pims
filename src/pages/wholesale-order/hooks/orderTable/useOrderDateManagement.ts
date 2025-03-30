
import { useState, useCallback } from 'react';

export function useOrderDateManagement(setOrderNumber: (value: string) => void) {
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');

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
  }, [setOrderNumber]);

  return {
    orderDate,
    deliveryDate,
    setOrderDate,
    setDeliveryDate,
    handleOrderDateChange,
    handleDeliveryDateChange,
    generateOrderNumber
  };
}
