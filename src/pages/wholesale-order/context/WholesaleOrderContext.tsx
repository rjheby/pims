
import { createContext, useContext, useState, PropsWithChildren, ChangeEvent, useCallback } from "react";
import { OrderItem, DropdownOptions, emptyOptions } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkIsAdmin } from "../utils/permissions";
import { supabase } from "@/integrations/supabase/client";

// Create a client
const queryClient = new QueryClient();

// Provider wrapper to ensure QueryClient is always available
export function WholesaleOrderQueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

interface WholesaleOrderContextProps {
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
  options: DropdownOptions;
  setOptions: (options: DropdownOptions) => void;
  editingField: keyof DropdownOptions | null;
  setEditingField: (field: keyof DropdownOptions | null) => void;
  editingRowId: number | null;
  setEditingRowId: (rowId: number | null) => void;
  newOption: string;
  setNewOption: (option: string) => void;
  orderNumber: string;
  setOrderNumber: (orderNumber: string) => void;
  orderDate: string;
  setOrderDate: (orderDate: string) => void;
  deliveryDate: string;
  setDeliveryDate: (deliveryDate: string) => void;
  isAdmin: boolean;
  loadOptions: () => Promise<void>;
  isLoadingOptions: boolean;
  handleOrderDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  generateOrderNumber: (date: string) => Promise<string>;
}

const WholesaleOrderContext = createContext<WholesaleOrderContextProps | undefined>(
  undefined
);

export function useWholesaleOrder(): WholesaleOrderContextProps {
  const context = useContext(WholesaleOrderContext);
  if (!context) {
    throw new Error(
      "useWholesaleOrder must be used within a WholesaleOrderProvider"
    );
  }
  return context;
}

interface WholesaleOrderProviderProps {
  initialItems?: OrderItem[];
}

export function WholesaleOrderProvider({ children, initialItems = [] }: PropsWithChildren<WholesaleOrderProviderProps>) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [options, setOptions] = useState<DropdownOptions>(emptyOptions);
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [newOption, setNewOption] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const { toast } = useToast();
  
  // Use React Query hook for admin status
  const { data: isAdmin = false } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: () => checkIsAdmin(),
  });

  // Load dropdown options from Supabase
  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    
    try {
      console.log('Loading options from Supabase...');
      
      // First attempt to get options from wholesale_order_options table
      const { data, error } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching options from Supabase:', error);
        throw error;
      }

      if (data) {
        console.log('Options fetched successfully from wholesale_order_options:', data);
        setOptions({
          species: Array.isArray(data.species) ? data.species : [],
          length: Array.isArray(data.length) ? data.length : [],
          bundleType: Array.isArray(data.bundleType) ? data.bundleType : [],
          thickness: Array.isArray(data.thickness) ? data.thickness : [],
          packaging: Array.isArray(data.packaging) ? data.packaging : []
        });
        return;
      }
      
      console.log('No options found in wholesale_order_options, extracting from wood_products...');
      
      // If no options in wholesale_order_options, extract from wood_products
      const { data: productsData, error: productsError } = await supabase
        .from('wood_products')
        .select('species, length, bundle_type, thickness')
        .limit(100);
        
      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }
      
      if (productsData && productsData.length > 0) {
        // Extract unique values
        const uniqueSpecies = [...new Set(productsData.map(p => p.species).filter(Boolean))];
        const uniqueLength = [...new Set(productsData.map(p => p.length).filter(Boolean))];
        const uniqueBundleType = [...new Set(productsData.map(p => p.bundle_type).filter(Boolean))];
        const uniqueThickness = [...new Set(productsData.map(p => p.thickness).filter(Boolean))];
        
        const extractedOptions = {
          species: uniqueSpecies,
          length: uniqueLength,
          bundleType: uniqueBundleType,
          thickness: uniqueThickness,
          packaging: ["Pallets", "Boxes", "Bundles"]
        };
        
        console.log('Extracted options from products:', extractedOptions);
        setOptions(extractedOptions);
        
        // Try to save these options for future use
        try {
          const { error: insertError } = await supabase
            .from('wholesale_order_options')
            .insert([extractedOptions]);
            
          if (insertError) {
            console.error('Error saving extracted options:', insertError);
          }
        } catch (err) {
          console.error('Failed to save extracted options:', err);
        }
        
        return;
      }
      
      // Fallback options if no data found in any table
      console.warn('No options found in database, using fallback');
      setOptions({
        species: ["Pine", "Spruce", "Fir", "Cedar", "Maple"],
        length: ["8'", "10'", "12'", "16'", "20'"],
        bundleType: ["2x4", "2x6", "2x8", "2x10", "2x12", "4x4", "6x6"],
        thickness: ["KD", "Green", "Treated"],
        packaging: ["Pallets", "Bunks", "Banded", "Loose"]
      });
    } catch (error: any) {
      console.error('Error loading options from Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to load dropdown options: " + error.message,
        variant: "destructive",
      });
      
      // Fallback to default options only as last resort
      setOptions({
        species: ["Pine", "Spruce", "Fir", "Cedar", "Maple"],
        length: ["8'", "10'", "12'", "16'", "20'"],
        bundleType: ["2x4", "2x6", "2x8", "2x10", "2x12", "4x4", "6x6"],
        thickness: ["KD", "Green", "Treated"],
        packaging: ["Pallets", "Bunks", "Banded", "Loose"]
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  const handleOrderDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOrderDate(e.target.value);
  };

  const generateOrderNumber = async (date: string): Promise<string> => {
    // First check if there are existing orders from the same date to ensure unique numbering
    try {
      const shortDate = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
      
      // Get current orders with this date pattern
      const { data: existingOrders } = await supabase
        .from('wholesale_orders')
        .select('order_number')
        .ilike('order_number', `${shortDate}-%`);
      
      let nextNumber = 1;
      
      if (existingOrders && existingOrders.length > 0) {
        // Extract all numbers after the dash
        const existingNumbers = existingOrders
          .map(order => {
            const match = order.order_number.match(new RegExp(`${shortDate}-([0-9]+)`));
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => !isNaN(num));
        
        // Find max and add 1
        if (existingNumbers.length > 0) {
          nextNumber = Math.max(...existingNumbers) + 1;
        }
      }
      
      // Format with leading zeros to 3 digits
      const orderNumber = `${shortDate}-${nextNumber.toString().padStart(3, '0')}`;
      setOrderNumber(orderNumber);
      return orderNumber;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback to random number if DB query fails
      const random = Math.floor(Math.random() * 1000);
      const shortDate = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
      const orderNumber = `${shortDate}-${random.toString().padStart(3, '0')}`;
      setOrderNumber(orderNumber);
      return orderNumber;
    }
  };

  const contextValue = {
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
    isAdmin,
    loadOptions,
    isLoadingOptions,
    handleOrderDateChange,
    generateOrderNumber
  };

  return (
    <WholesaleOrderContext.Provider value={contextValue}>
      {children}
    </WholesaleOrderContext.Provider>
  );
}
