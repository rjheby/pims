
import { useState, useCallback } from "react";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";
import { DropdownOptions, OrderItem, emptyOptions, safeNumber, generateEmptyOrderItem } from "../../types";
import { handleOptionOperation } from "../../utils/optionManagement";
import { toast } from "sonner";

export function useOrderActions() {
  const { 
    items = [], 
    setItems, 
    options = emptyOptions,
    setOptions, 
    setEditingField,
    setNewOption
  } = useWholesaleOrder();

  const [lastOptionField, setLastOptionField] = useState<keyof DropdownOptions | null>(null);

  // Update an item in the order - rebuilt with better error handling
  const handleUpdateItem = useCallback((updatedItem: OrderItem) => {
    try {
      console.log('Updating item:', updatedItem);
      setItems(prevItems => 
        prevItems.map(item => (item.id === updatedItem.id ? updatedItem : item))
      );
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error("Failed to update item");
    }
  }, [setItems]);

  // Remove a row from the order - rebuilt with better error handling
  const handleRemoveRow = useCallback((id: number) => {
    try {
      console.log('Removing row:', id);
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      toast.success("Row removed");
    } catch (error) {
      console.error('Error removing row:', error);
      toast.error("Failed to remove row");
    }
  }, [setItems]);

  // Copy a row in the order - rebuilt with better error handling
  const handleCopyRow = useCallback((itemToCopy: OrderItem) => {
    try {
      console.log('Copying row:', itemToCopy);
      const newItem = {
        ...itemToCopy,
        id: Date.now(), // Ensure unique ID
      };
      
      setItems(prevItems => [...prevItems, newItem]);
      toast.success("Row copied");
    } catch (error) {
      console.error('Error copying row:', error);
      toast.error("Failed to copy row");
    }
  }, [setItems]);

  // Add a new empty item to the order - completely rebuilt
  const handleAddItem = useCallback(() => {
    console.log('handleAddItem called');
    
    try {
      // Generate new item with timestamp-based ID to ensure uniqueness
      const newItem = generateEmptyOrderItem();
      console.log('Generated new item:', newItem);
      
      // Use functional update to ensure we're working with the latest state
      setItems(prevItems => {
        console.log('Previous items count:', prevItems.length);
        const updatedItems = [...prevItems, newItem];
        console.log('New items count:', updatedItems.length);
        return updatedItems;
      });
      
      // Show success notification
      toast.success("New row added");
    } catch (error) {
      // Log and show error notification
      console.error('Error adding new item:', error);
      toast.error("Failed to add new row");
    }
  }, [setItems]);

  // Handle key press events in the form
  const handleKeyPress = useCallback((
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
  }, [lastOptionField]);

  // Start editing a dropdown field
  const handleStartEditingField = useCallback((field: keyof DropdownOptions) => {
    console.log("Starting to edit field:", field);
    setEditingField(field);
    setLastOptionField(field);
    setNewOption(""); // Reset the new option input value
  }, [setEditingField, setNewOption]);

  // Update dropdown options
  const handleUpdateOptions = useCallback(async (option: string) => {
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
        toast.success(`Added new ${lastOptionField} option: ${option}`);
      }
      
      // Clear the editing state
      setEditingField(null);
      
    } catch (err) {
      console.error('Error in handleUpdateOptions:', err);
      toast.error(`Failed to add option: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [lastOptionField, options, setEditingField, setOptions]);

  // Set updated options from the dropdown cell component
  const handleOptionsUpdated = useCallback((updatedOptions: DropdownOptions) => {
    console.log("Setting updated options:", updatedOptions);
    setOptions(updatedOptions);
    setEditingField(null);
    toast.success("Options updated");
  }, [setOptions, setEditingField]);

  // Calculate total order capacity in pallet equivalents
  const calculateTotalCapacity = useCallback((orderItems: OrderItem[]): number => {
    return orderItems.reduce((total, item) => {
      // If packaging is "12x10" Boxes", convert to pallet equivalents (60 boxes = 1 pallet)
      if (item.packaging === "12x10\" Boxes") {
        return total + (safeNumber(item.pallets) / 60);
      }
      // For all other packaging types, use actual pallet count
      return total + safeNumber(item.pallets);
    }, 0);
  }, []);

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
