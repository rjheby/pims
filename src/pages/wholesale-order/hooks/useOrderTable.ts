
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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterValue, setFilterValue] = useState("");

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

  // Apply sorting and filtering
  let processedItems = [...items];

  if (sortConfig) {
    processedItems.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof OrderItem];
      const bValue = b[sortConfig.key as keyof OrderItem];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      // When comparing different types or nulls
      if (!aValue && bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue && !bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      
      return 0;
    });
  }

  if (filterValue) {
    processedItems = processedItems.filter(item => {
      const searchLower = filterValue.toLowerCase();
      
      // Check main properties
      if (
        (item.species && item.species.toLowerCase().includes(searchLower)) ||
        (item.length && item.length.toLowerCase().includes(searchLower)) ||
        (item.bundleType && item.bundleType.toLowerCase().includes(searchLower)) ||
        (item.thickness && item.thickness.toLowerCase().includes(searchLower)) ||
        (item.packaging && item.packaging.toLowerCase().includes(searchLower))
      ) {
        return true;
      }
      
      // Check numeric values as strings
      if (
        item.pallets?.toString().includes(searchLower) ||
        item.unitCost?.toString().includes(searchLower)
      ) {
        return true;
      }
      
      // Check the generated name
      const name = generateItemName(item).toLowerCase();
      if (name.includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  }

  return {
    items: processedItems,
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
    sortConfig,
    setSortConfig,
    filterValue,
    setFilterValue,
  };
}
