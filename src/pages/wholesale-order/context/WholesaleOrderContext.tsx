
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useCallback } from "react";
import { OrderItem, DropdownOptions, initialOptions } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { useHistory } from "@/context/HistoryContext";

interface WholesaleOrderContextType {
  orderNumber: string;
  setOrderNumber: (value: string) => void;
  orderDate: string;
  setOrderDate: (value: string) => void;
  deliveryDate: string;
  setDeliveryDate: (value: string) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  options: DropdownOptions;
  setOptions: (value: DropdownOptions) => void;
  optionsHistory: DropdownOptions[];
  setOptionsHistory: (value: DropdownOptions[]) => void;
  editingField: keyof DropdownOptions | null;
  setEditingField: (value: keyof DropdownOptions | null) => void;
  newOption: string;
  setNewOption: (value: string) => void;
  items: OrderItem[];
  setItems: Dispatch<SetStateAction<OrderItem[]>>;
  saveChanges: () => void;
  discardChanges: () => void;
  undoLastChange: () => void;
  handleOrderDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateOrderNumber: (date: string) => Promise<string>;
  loadOptions: () => Promise<void>;
  isLoadingOptions: boolean;
}

const WholesaleOrderContext = createContext<WholesaleOrderContextType | undefined>(undefined);

interface WholesaleOrderProviderProps {
  children: ReactNode;
  initialItems?: OrderItem[];
}

export function WholesaleOrderProvider({ children, initialItems }: WholesaleOrderProviderProps) {
  const { toast } = useToast();
  const { setHasUnsavedChanges: setGlobalUnsavedChanges } = useAdmin();
  const { addAction } = useHistory();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [optionsHistory, setOptionsHistory] = useState<DropdownOptions[]>([initialOptions]);
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [newOption, setNewOption] = useState("");
  const [items, setItems] = useState<OrderItem[]>(initialItems || [{
    id: 1,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets",
    pallets: 0,
    unitCost: 250,
  }]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // Track initial items to detect changes
  const [initialItemsState] = useState<OrderItem[]>(JSON.parse(JSON.stringify(initialItems || [])));

  // Load options from Supabase
  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const { data, error } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, use initial options
          console.log('No options found in database, using default options');
          // Save initial options to database for future use
          await saveOptionsToSupabase(initialOptions);
        } else {
          console.error('Error loading options:', error);
          toast({
            title: "Error loading options",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data) {
        console.log('Options loaded from database:', data);
        // Remove id field from data before setting options
        const { id, created_at, ...optionsData } = data;
        setOptions(optionsData as DropdownOptions);
        setOptionsHistory([optionsData as DropdownOptions]);
      }
    } catch (err) {
      console.error('Error in loadOptions:', err);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  // Save options to Supabase
  const saveOptionsToSupabase = async (optionsToSave: DropdownOptions) => {
    try {
      const { error } = await supabase
        .from('wholesale_order_options')
        .upsert({ 
          id: 1, // Use a fixed ID since we only need one row
          ...optionsToSave
        });

      if (error) {
        console.error('Error saving options to database:', error);
        throw error;
      }
      
      console.log('Options saved to database');
    } catch (err) {
      console.error('Error in saveOptionsToSupabase:', err);
      throw err;
    }
  };

  // Custom setItems function that tracks history
  const handleSetItems = (newItemsOrUpdater: OrderItem[] | ((prevItems: OrderItem[]) => OrderItem[])) => {
    setItems(prevItems => {
      const prevItemsCopy = [...prevItems];
      const newItems = typeof newItemsOrUpdater === 'function' 
        ? newItemsOrUpdater(prevItems)
        : newItemsOrUpdater;
      
      // Record this action in history
      addAction({
        payload: { type: 'items', data: newItems },
        reverse: () => setItems(prevItemsCopy)
      });
      
      return newItems;
    });
  };

  // Custom setOptions function that tracks history
  const handleSetOptions = (newOptions: DropdownOptions) => {
    const prevOptions = { ...options };
    setOptions(newOptions);
    setHasUnsavedChanges(true);
    
    // Record this action in history
    addAction({
      payload: { type: 'options', data: newOptions },
      reverse: () => setOptions(prevOptions)
    });
  };

  useEffect(() => {
    // Mark changes when items are modified compared to the initial state
    if (initialItemsState.length > 0) {
      const itemsChanged = JSON.stringify(items) !== JSON.stringify(initialItemsState);
      if (itemsChanged) {
        setHasUnsavedChanges(true);
        setGlobalUnsavedChanges(true);
      }
    }
  }, [items, initialItemsState, setGlobalUnsavedChanges]);

  const generateOrderNumber = async (date: string) => {
    if (!date) return "";
    const orderDate = new Date(date);
    const year = orderDate.getFullYear().toString().slice(-2);
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    
    const yearMonth = `${year}${month}`;
    const { data: existingOrders } = await supabase
      .from('wholesale_orders')
      .select('order_number')
      .ilike('order_number', `${yearMonth}-%`)
      .order('order_number', { ascending: false });

    let sequence = 1;
    if (existingOrders && existingOrders.length > 0) {
      const latestOrder = existingOrders[0];
      const currentSequence = parseInt(latestOrder.order_number.split('-')[1]);
      sequence = currentSequence + 1;
    }

    const orderSequence = sequence.toString().padStart(2, '0');
    return `${yearMonth}-${orderSequence}`;
  };

  useEffect(() => {
    const initializeOrderNumber = async () => {
      if (orderDate && !orderNumber) {
        console.log('Initializing order number with date:', orderDate);
        const newOrderNumber = await generateOrderNumber(orderDate);
        console.log('Generated order number:', newOrderNumber);
        setOrderNumber(newOrderNumber);
      }
    };
    initializeOrderNumber();
  }, [orderDate, orderNumber]);

  const handleOrderDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    const newOrderNumber = await generateOrderNumber(newDate);
    setOrderNumber(newOrderNumber);
  };

  const saveChanges = async () => {
    if (hasUnsavedChanges) {
      try {
        // Save the options to Supabase
        await saveOptionsToSupabase(options);
        
        setOptionsHistory([...optionsHistory, options]);
        setHasUnsavedChanges(false);
        setGlobalUnsavedChanges(false);
        toast({
          title: "Changes saved",
          description: "Your changes have been saved successfully.",
        });
      } catch (err: any) {
        toast({
          title: "Error saving changes",
          description: err.message || "Failed to save changes",
          variant: "destructive"
        });
      }
    }
  };

  const discardChanges = () => {
    if (hasUnsavedChanges) {
      setOptions(optionsHistory[optionsHistory.length - 1]);
      setHasUnsavedChanges(false);
      setGlobalUnsavedChanges(false);
      toast({
        title: "Changes discarded",
        description: "Your changes have been discarded.",
      });
    }
  };

  const undoLastChange = () => {
    if (optionsHistory.length > 1) {
      const previousOptions = optionsHistory[optionsHistory.length - 2];
      setOptions(previousOptions);
      setOptionsHistory(optionsHistory.slice(0, -1));
      setHasUnsavedChanges(true);
      setGlobalUnsavedChanges(true);
      toast({
        title: "Change undone",
        description: "The last change has been undone.",
      });
    }
  };

  const value = {
    orderNumber,
    setOrderNumber,
    orderDate,
    setOrderDate,
    deliveryDate,
    setDeliveryDate,
    isAdmin,
    setIsAdmin,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    options,
    setOptions: handleSetOptions,
    optionsHistory,
    setOptionsHistory,
    editingField,
    setEditingField,
    newOption,
    setNewOption,
    items,
    setItems: handleSetItems,
    saveChanges,
    discardChanges,
    undoLastChange,
    handleOrderDateChange,
    generateOrderNumber,
    loadOptions,
    isLoadingOptions,
  };

  return (
    <WholesaleOrderContext.Provider value={value}>
      {children}
    </WholesaleOrderContext.Provider>
  );
}

export const useWholesaleOrder = () => {
  const context = useContext(WholesaleOrderContext);
  if (context === undefined) {
    throw new Error("useWholesaleOrder must be used within a WholesaleOrderProvider");
  }
  return context;
};
