
import React, { createContext, useContext, useState, ReactNode } from "react";
import { OrderItem, DropdownOptions, initialOptions } from "../types";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface WholesaleOrderContextType {
  items: OrderItem[];
  options: DropdownOptions;
  isAdmin: boolean;
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  setNewOption: (value: string) => void;
  setEditingField: (value: keyof DropdownOptions | null) => void;
  setItems: (items: OrderItem[] | ((prev: OrderItem[]) => OrderItem[])) => void;
  setOptions: (options: DropdownOptions) => void;
  handleOrderDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDeliveryDate: (value: string) => void;
  generateOrderNumber: (date: string) => Promise<string>;
  onItemsChanged?: (items: OrderItem[]) => void;
}

const WholesaleOrderContext = createContext<WholesaleOrderContextType | undefined>(undefined);

interface WholesaleOrderProviderProps {
  children: ReactNode;
  initialItems?: OrderItem[];
  isAdmin?: boolean;
  onItemsChanged?: (items: OrderItem[]) => void;
}

export function WholesaleOrderProvider({ 
  children, 
  initialItems = [], 
  isAdmin = false,
  onItemsChanged
}: WholesaleOrderProviderProps) {
  const { id } = useParams();
  const [items, setItemsInternal] = useState<OrderItem[]>(initialItems);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [newOption, setNewOption] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  // Custom setItems function that also calls the onItemsChanged callback
  const setItems = (value: OrderItem[] | ((prev: OrderItem[]) => OrderItem[])) => {
    setItemsInternal((prev) => {
      const newItems = typeof value === 'function' ? value(prev) : value;
      
      // Call the callback if provided
      if (onItemsChanged) {
        onItemsChanged(newItems);
      }
      
      return newItems;
    });
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderDate(e.target.value);
  };

  const generateOrderNumber = async (date: string): Promise<string> => {
    try {
      if (!date) {
        console.error("No date provided for order number generation");
        return "";
      }

      // Extract month and date from the order date
      const dateParts = date.split('-');
      
      if (dateParts.length < 3) {
        console.error("Invalid date format for order number generation");
        return "";
      }
      
      const month = dateParts[1];
      const day = dateParts[2];
      
      // Count existing orders for this month to generate the sequence number
      const { data, error } = await supabase
        .from('wholesale_orders')
        .select('order_number')
        .like('order_number', `${month}${day}-%`);
      
      if (error) {
        console.error("Error fetching order numbers:", error);
        return "";
      }
      
      // Generate the next sequence number (starting with 01)
      const sequenceNumber = (data?.length || 0) + 1;
      const paddedSequence = String(sequenceNumber).padStart(2, '0');
      
      // Format: MM-DD-XX
      const generatedOrderNumber = `${month}${day}-${paddedSequence}`;
      
      console.info("Generated order number:", generatedOrderNumber);
      setOrderNumber(generatedOrderNumber);
      
      return generatedOrderNumber;
    } catch (error) {
      console.error("Error generating order number:", error);
      return "";
    }
  };

  return (
    <WholesaleOrderContext.Provider
      value={{
        items,
        options,
        isAdmin,
        orderNumber,
        orderDate,
        deliveryDate,
        editingField,
        newOption,
        setNewOption,
        setEditingField,
        setItems,
        setOptions,
        handleOrderDateChange,
        setDeliveryDate,
        generateOrderNumber,
        onItemsChanged
      }}
    >
      {children}
    </WholesaleOrderContext.Provider>
  );
}

export function useWholesaleOrder() {
  const context = useContext(WholesaleOrderContext);
  if (context === undefined) {
    throw new Error("useWholesaleOrder must be used within a WholesaleOrderProvider");
  }
  return context;
}
