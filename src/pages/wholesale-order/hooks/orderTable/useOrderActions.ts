
import { useState } from "react";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { DropdownOptions, OrderItem, safeNumber } from "../../types";
import { generateEmptyOrderItem } from "../../utils";

export function useOrderActions() {
  const { 
    items = [], 
    setItems, 
    options = {}, 
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

    // Add the new option to the dropdown
    setOptions({
      ...options,
      [field]: [...(options[field] || []), option],
    });

    setEditingField(null);
  };

  return {
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    handleKeyPress,
    handleUpdateOptions,
  };
}
