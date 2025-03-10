
import { useState } from "react";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { DropdownOptions, OrderItem, initialOptions, safeNumber } from "../../types";
import { generateEmptyOrderItem } from "../../utils";

export function useOrderActions() {
  const { 
    items = [], 
    setItems, 
    options = initialOptions, // Ensure options has a default value of initialOptions
    setOptions, 
    setEditingField
  } = useWholesaleOrder();

  const [lastOptionField, setLastOptionField] = useState<keyof DropdownOptions | null>(null);

  // Update an item in the order
  const handleUpdateItem = (updatedItem: OrderItem) => {
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Remove a row from the order
  const handleRemoveRow = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Copy a row in the order
  const handleCopyRow = (itemToCopy: OrderItem) => {
    const newItem = {
      ...itemToCopy,
      id: Date.now(),
    };
    setItems([...items, newItem]);
  };

  // Add a new empty item to the order
  const handleAddItem = () => {
    const newItem = generateEmptyOrderItem();
    setItems([...items, newItem]);
  };

  // Handle key press events in the form
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Get the new option from the input
      const target = e.target as HTMLInputElement;
      const value = target.value.trim();

      if (fieldName && value && lastOptionField) {
        handleUpdateOptions(lastOptionField, value);
        setLastOptionField(null);
      }
    }
  };

  // Start editing a dropdown field
  const handleStartEditingField = (field: keyof DropdownOptions) => {
    setEditingField(field);
    setLastOptionField(field);
  };

  // Update dropdown options
  const handleUpdateOptions = (
    field: keyof DropdownOptions,
    option: string
  ) => {
    if (!option || option.trim() === "") return;

    // Check if the option already exists
    if (options[field]?.includes(option)) {
      setEditingField(null);
      return;
    }

    // Create a properly typed DropdownOptions object with all required fields
    const updatedOptions: DropdownOptions = {
      species: [...(options.species || [])],
      length: [...(options.length || [])],
      bundleType: [...(options.bundleType || [])],
      thickness: [...(options.thickness || [])],
      packaging: [...(options.packaging || [])]
    };
    
    // Update the specific field
    updatedOptions[field] = [...(options[field] || []), option];
    
    // Set the updated options
    setOptions(updatedOptions);

    setEditingField(null);
  };

  // Calculate item capacity in pallet equivalents
  const calculateItemCapacity = (item: OrderItem): number => {
    // If packaging is "12x10" Boxes", convert to pallet equivalents (60 boxes = 1 pallet)
    if (item.packaging === "12x10\" Boxes") {
      return safeNumber(item.pallets) / 60;
    }
    // For all other packaging types (including "Pallets"), use actual pallet count
    return safeNumber(item.pallets);
  };

  // Calculate total order capacity in pallet equivalents
  const calculateTotalCapacity = (orderItems: OrderItem[]): number => {
    return orderItems.reduce((total, item) => total + calculateItemCapacity(item), 0);
  };

  return {
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    handleKeyPress,
    handleUpdateOptions,
    handleStartEditingField,
    calculateItemCapacity,
    calculateTotalCapacity,
  };
}
