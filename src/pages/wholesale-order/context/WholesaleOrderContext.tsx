
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, useCallback } from "react";
import { OrderItem, DropdownOptions } from "../types";
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

// Default empty options structure - this will be filled from the database
const emptyOptions: DropdownOptions = {
  species: [],
  length: [],
  bundleType: [],
  thickness: [],
  packaging: []
};

// Helper type for the Supabase wholesale_order_options table row
type WholesaleOrderOptionsRow = {
  id: number;
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
  created_at?: string;
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
  const [isAdmin, setIsAdmin] = useState(true); // Default to true for easier testing
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(emptyOptions);
  const [optionsHistory, setOptionsHistory] = useState<DropdownOptions[]>([emptyOptions]);
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
      // First try to get options from wholesale_order_options table
      const { data: optionsData, error: optionsError } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .eq('id', 1)
        .single();

      // Initialize options object that will be populated with real data
      const loadedOptions: DropdownOptions = { ...emptyOptions };

      // Fetch unique attribute values from wood_products table
      const { data: woodProducts, error: woodProductsError } = await supabase
        .from('wood_products')
        .select('species, length, bundle_type, thickness');

      if (woodProductsError) {
        console.error('Error loading wood products:', woodProductsError);
        throw woodProductsError;
      }

      if (woodProducts && woodProducts.length > 0) {
        // Extract unique values for each attribute
        const uniqueSpecies = [...new Set(woodProducts.map(p => p.species))];
        const uniqueLength = [...new Set(woodProducts.map(p => p.length))];
        const uniqueBundleType = [...new Set(woodProducts.map(p => p.bundle_type))];
        const uniqueThickness = [...new Set(woodProducts.map(p => p.thickness))];

        // Populate options with values from wood_products
        loadedOptions.species = uniqueSpecies;
        loadedOptions.length = uniqueLength;
        loadedOptions.bundleType = uniqueBundleType;
        loadedOptions.thickness = uniqueThickness;
      }

      // Add packaging options from the options table if available
      if (optionsData) {
        loadedOptions.packaging = optionsData.packaging || ['Pallets', 'Crates', 'Boxes', '12x10" Boxes'];
      } else {
        loadedOptions.packaging = ['Pallets', 'Crates', 'Boxes', '12x10" Boxes'];
        
        // If options table doesn't exist, create it with the current options
        await saveOptionsToSupabase(loadedOptions);
      }

      console.log('Options loaded from database:', loadedOptions);
      setOptions(loadedOptions);
      setOptionsHistory([loadedOptions]);

    } catch (err) {
      console.error('Error in loadOptions:', err);
      toast({
        title: "Error loading options",
        description: "Failed to load product options from the database",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  // Save options to Supabase
  const saveOptionsToSupabase = async (optionsToSave: DropdownOptions) => {
    try {
      // Using the `.from('table_name')` syntax 
      const { error } = await supabase
        .from('wholesale_order_options')
        .upsert({ 
          id: 1, // Use a fixed ID since we only need one row
          species: optionsToSave.species,
          length: optionsToSave.length,
          bundleType: optionsToSave.bundleType,
          thickness: optionsToSave.thickness,
          packaging: optionsToSave.packaging
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
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
    setGlobalUnsavedChanges(true);
  };

  // Custom setOptions function that tracks history
  const handleSetOptions = (newOptions: DropdownOptions) => {
    const prevOptions = JSON.parse(JSON.stringify(options));
    setOptions(newOptions);
    setHasUnsavedChanges(true);
    setGlobalUnsavedChanges(true);
    
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

  useEffect(() => {
    // Load options when the provider is mounted
    loadOptions();
  }, [loadOptions]);

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
