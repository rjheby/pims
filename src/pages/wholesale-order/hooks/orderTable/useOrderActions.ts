
import { useState } from "react";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { DropdownOptions, OrderItem, initialOptions, safeNumber } from "../../types";
import { generateEmptyOrderItem } from "../../utils";

export function useOrderActions() {
  const { 
    items = [], 
    setItems, 
    options = initialOptions,
    setOptions, 
    setEditingField,
    setNewOption
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
    console.log("Starting to edit field:", field);
    setEditingField(field);
    setLastOptionField(field);
    setNewOption(""); // Reset the new option input value
  };

  // Update dropdown options
  const handleUpdateOptions = (
    field: keyof DropdownOptions,
    option: string
  ) => {
    console.log("Updating options for field:", field, "with new option:", option);
    
    if (!option || option.trim() === "") {
      console.log("Empty option, ignoring");
      setEditingField(null);
      return;
    }

    // Create a deep copy of the current options
    const updatedOptions = JSON.parse(JSON.stringify(options));
    
    // Ensure the field exists and is an array before updating
    if (!updatedOptions[field] || !Array.isArray(updatedOptions[field])) {
      updatedOptions[field] = [];
    }
    
    // Check if we're editing an existing option (by checking if it already exists)
    const existingOptionIndex = updatedOptions[field].findIndex(
      (existingOption: string) => existingOption === option
    );
    
    if (existingOptionIndex === -1) {
      // This is a new option, add it to the array
      updatedOptions[field] = [...updatedOptions[field], option];
      console.log("Added new option:", option);
    }
    
    // Log the update for debugging
    console.log("Updated options:", updatedOptions);
    
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
