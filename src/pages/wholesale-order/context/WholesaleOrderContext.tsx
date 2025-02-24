import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { OrderItem, DropdownOptions, initialOptions } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/context/AdminContext";

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
  generateOrderNumber: (date: string) => string;
}

const WholesaleOrderContext = createContext<WholesaleOrderContextType | undefined>(undefined);

export function WholesaleOrderProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { setHasUnsavedChanges: setGlobalUnsavedChanges } = useAdmin();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [optionsHistory, setOptionsHistory] = useState<DropdownOptions[]>([initialOptions]);
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [newOption, setNewOption] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      unitCost: 250,
    },
  ]);

  const generateOrderNumber = (date: string) => {
    if (!date) return "";
    const orderDate = new Date(date);
    const year = orderDate.getFullYear().toString().slice(-2);
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    const orderSequence = "01";
    return `${year}${month}-${orderSequence}`;
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    setOrderNumber(generateOrderNumber(newDate));
  };

  const saveChanges = () => {
    if (hasUnsavedChanges) {
      setOptionsHistory([...optionsHistory, options]);
      setHasUnsavedChanges(false);
      setGlobalUnsavedChanges(false);
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
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
    setOptions,
    optionsHistory,
    setOptionsHistory,
    editingField,
    setEditingField,
    newOption,
    setNewOption,
    items,
    setItems,
    saveChanges,
    discardChanges,
    undoLastChange,
    handleOrderDateChange,
    generateOrderNumber,
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
