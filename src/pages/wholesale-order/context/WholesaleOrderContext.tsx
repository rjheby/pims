
import { createContext, useContext, useState, PropsWithChildren, ChangeEvent, useCallback } from "react";
import { OrderItem, DropdownOptions, emptyOptions } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkIsAdmin } from "../utils/permissions";

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

  // Load dropdown options
  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      // Simulate fetching options from API or database
      const species = ["Pine", "Spruce", "Fir", "Cedar", "Maple"];
      const length = ["8'", "10'", "12'", "16'", "20'"];
      const bundleType = ["2x4", "2x6", "2x8", "2x10", "2x12", "4x4", "6x6"];
      const thickness = ["KD", "Green", "Treated"];
      const packaging = ["Pallets", "Bunks", "Banded", "Loose"];

      setOptions({
        species,
        length,
        bundleType,
        thickness,
        packaging,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load options",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  const handleOrderDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOrderDate(e.target.value);
  };

  const generateOrderNumber = async (date: string): Promise<string> => {
    const shortDate = date.slice(2, 4) + date.slice(5, 7) + date.slice(8, 10);
    const random = Math.floor(Math.random() * 1000);
    const orderNumber = `${shortDate}-${random.toString().padStart(3, '0')}`;
    setOrderNumber(orderNumber);
    return orderNumber;
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
