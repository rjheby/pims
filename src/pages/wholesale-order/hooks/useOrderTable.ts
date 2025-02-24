
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
    setItems(prev => 
      prev.map((item) =>
        item.id === id ? { 
          ...item, 
          [field]: value,
          // Set default unit cost when species is updated
          ...(field === 'species' ? { unitCost: 250 } : {})
        } : item
      )
    );
  };

  const handleRemoveRow = (id: number) => {
    setItems(prev => prev.filter((item) => item.id !== id));
  };

  const handleCopyRow = (item: OrderItem) => {
    const maxId = Math.max(...items.map((item) => item.id), 0);
    setItems(prev => [...prev, { ...item, id: maxId + 1 }]);
  };

  const handleAddItem = () => {
    const maxId = Math.max(...items.map((item) => item.id), 0);
    setItems(prev => [
      ...prev,
      {
        id: maxId + 1,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        packaging: "Pallets",
        pallets: 0,
        unitCost: 250, // Default unit cost
      },
    ]);
  };

  const calculateTotalPallets = () => {
    return items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  };

  const generateItemName = (item: OrderItem) => {
    if (!item) return "New Item";
    const parts = [];

    if (item.pallets && item.packaging) {
      parts.push(`${item.pallets} ${item.packaging} of`);
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

  const hasValidItems = items.some(item => {
    return item.species && 
           item.length && 
           item.bundleType && 
           item.thickness && 
           item.pallets > 0;
  });

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
    hasValidItems,
    calculateTotalPallets,
    calculateTotalCost,
  };
}
