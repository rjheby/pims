
import { useState } from "react";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { DropdownOptions, OrderItem, initialOptions, safeNumber } from "../../types";
import { generateEmptyOrderItem } from "../../utils";
import { handleOptionOperation } from "../../utils/optionManagement";
import { toast } from "sonner";

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
    console.log('Updating item:', updatedItem);
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Remove a row from the order
  const handleRemoveRow = (id: number) => {
    console.log('Removing row:', id);
    setItems(items.filter((item) => item.id !== id));
  };

  // Copy a row in the order
  const handleCopyRow = (itemToCopy: OrderItem) => {
    console.log('Copying row:', itemToCopy);
    const newItem = {
      ...itemToCopy,
      id: Date.now(),
    };
    setItems([...items, newItem]);
  };

  // Add a new empty item to the order
  const handleAddItem = () => {
    console.log('Adding new item');
    try {
      const newItem = generateEmptyOrderItem();
      console.log('Generated new item:', newItem);
      setItems(prevItems => {
        console.log('Previous items:', prevItems);
        return [...prevItems, newItem];
      });
      toast.success("New row added");
    } catch (error) {
      console.error('Error adding new item:', error);
      toast.error("Failed to add new row");
    }
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
        handleUpdateOptions(value);
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
  const handleUpdateOptions = async (option: string) => {
    console.log("Updating options for field:", lastOptionField, "with new option:", option);
    
    if (!option || option.trim() === "" || !lastOptionField) {
      console.log("Empty option or no field selected, ignoring");
      setEditingField(null);
      return;
    }

    try {
      // Use the utility function to handle adding the option
      const updatedOptions = await handleOptionOperation(
        'add',
        lastOptionField,
        option,
        options
      );
      
      if (updatedOptions) {
        console.log("Updated options:", updatedOptions);
        setOptions(updatedOptions);
      }
      
      // Clear the editing state
      setEditingField(null);
      
    } catch (err) {
      console.error('Error in handleUpdateOptions:', err);
    }
  };

  // Set updated options from the dropdown cell component
  const handleOptionsUpdated = (updatedOptions: DropdownOptions) => {
    console.log("Setting updated options:", updatedOptions);
    setOptions(updatedOptions);
    setEditingField(null);
  };

  // Calculate total order capacity in pallet equivalents
  const calculateTotalCapacity = (orderItems: OrderItem[]): number => {
    return orderItems.reduce((total, item) => {
      // If packaging is "12x10" Boxes", convert to pallet equivalents (60 boxes = 1 pallet)
      if (item.packaging === "12x10\" Boxes") {
        return total + (safeNumber(item.pallets) / 60);
      }
      // For all other packaging types, use actual pallet count
      return total + safeNumber(item.pallets);
    }, 0);
  };

  return {
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    handleKeyPress,
    handleUpdateOptions,
    handleStartEditingField,
    handleOptionsUpdated,
    calculateTotalCapacity,
  };
}
