
import { useState } from "react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { OrderItem, DropdownOptions, initialOptions } from "../types";

export function useOrderTable() {
  const { 
    items = [], 
    options = initialOptions,
    isAdmin = false, 
    editingField, 
    newOption = "", 
    setNewOption, 
    setEditingField,
    setItems,
    setOptions 
  } = useWholesaleOrder();

  const [compressedStates, setCompressedStates] = useState<Record<number, boolean>>({});

  const safeOptions: DropdownOptions = {
    ...initialOptions,
    ...options
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => {
    if (e.key === "Enter" && newOption?.trim()) {
      const updatedOptions = [...(safeOptions[field] || []), newOption.trim()];
      setOptions({
        ...safeOptions,
        [field]: updatedOptions,
      });
      setNewOption("");
      setEditingField(null);
    }
  };

  const handleUpdateItem = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev: OrderItem[]) => 
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveRow = (id: number) => {
    setItems((prev: OrderItem[]) => prev.filter((item) => item.id !== id));
  };

  const handleCopyRow = (item: OrderItem) => {
    setItems((prev: OrderItem[]) => {
      const maxId = Math.max(...prev.map((item) => item.id), 0);
      return [...prev, { ...item, id: maxId + 1 }];
    });
  };

  const handleAddItem = () => {
    setItems((prev: OrderItem[]) => {
      const maxId = Math.max(...prev.map((item) => item.id), 0);
      return [
        ...prev,
        {
          id: maxId + 1,
          species: "",
          length: "",
          bundleType: "",
          thickness: "",
          packaging: "Pallets",
          pallets: 0,
          quantity: 0,
        },
      ];
    });
  };

  const generateItemName = (item: OrderItem) => {
    if (!item) return "New Item";
    const parts = [];

    if (item.quantity && item.packaging) {
      parts.push(`${item.quantity} ${item.packaging} of`);
    }

    if (item.species) parts.push(item.species);
    if (item.length) parts.push(item.length);
    if (item.bundleType) parts.push(item.bundleType);
    if (item.thickness) parts.push(item.thickness);

    return parts.join(" - ") || "New Item";
  };

  const handleUpdateOptions = (field: keyof DropdownOptions, newOptions: string[]) => {
    setOptions({
      ...safeOptions,
      [field]: newOptions,
    });
  };

  const toggleCompressed = (itemId: number) => {
    setCompressedStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return {
    items,
    options: safeOptions,
    isAdmin,
    editingField,
    newOption,
    compressedStates,
    optionFields: Object.keys(safeOptions) as Array<keyof DropdownOptions>,
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    generateItemName,
    handleUpdateOptions,
    toggleCompressed,
    setNewOption,
  };
}
