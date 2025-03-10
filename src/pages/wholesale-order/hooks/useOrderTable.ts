
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { OrderItem, initialOptions, safeNumber } from "../types";
import { useOrderActions } from "./orderTable/useOrderActions";
import { useOrderCalculations } from "./orderTable/useOrderCalculations";
import { useOrderFiltering } from "./orderTable/useOrderFiltering";
import { useOrderDisplay } from "./orderTable/useOrderDisplay";
import { useOrderValidation } from "./orderTable/useOrderValidation";
import { useEffect } from "react";

export function useOrderTable() {
  // Get context values first to maintain hook order
  const { 
    items = [], 
    options = initialOptions,
    isAdmin = false, 
    editingField, 
    newOption = "", 
    setNewOption, 
    setEditingField,
    setItems,
    setOptions,
    loadOptions,
    isLoadingOptions
  } = useWholesaleOrder();
  
  const safeOptions = {
    ...initialOptions,
    ...options
  };

  // Import all the smaller hooks in a consistent order to prevent React hook ordering issues
  const orderActions = useOrderActions();
  const { generateItemName, calculateTotalPallets, calculateTotalCost, formatCurrency } = useOrderCalculations();
  const orderFiltering = useOrderFiltering();
  const orderDisplay = useOrderDisplay();
  const { hasValidItems } = useOrderValidation(items);

  // Load options from Supabase when component mounts
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Process items with sorting and filtering
  const processedItems = orderFiltering.applyFiltersAndSorting(items, generateItemName);

  // Calculate total capacity considering box-to-pallet ratio
  const calculateTotalCapacity = () => {
    return orderActions.calculateTotalCapacity(items);
  };

  // Return a consolidated object with all the functionality
  return {
    items: processedItems,
    options: safeOptions,
    isAdmin,
    editingField,
    newOption,
    compressedStates: orderDisplay.compressedStates,
    optionFields: Object.keys(safeOptions) as Array<keyof typeof safeOptions>,
    handleKeyPress: orderActions.handleKeyPress,
    handleUpdateItem: orderActions.handleUpdateItem,
    handleRemoveRow: orderActions.handleRemoveRow,
    handleCopyRow: orderActions.handleCopyRow,
    handleAddItem: orderActions.handleAddItem,
    generateItemName,
    handleUpdateOptions: orderActions.handleUpdateOptions,
    handleStartEditingField: orderActions.handleStartEditingField,
    toggleCompressed: orderDisplay.toggleCompressed,
    setNewOption,
    hasValidItems,
    calculateTotalPallets,
    calculateTotalCost,
    calculateTotalCapacity,
    formatCurrency,
    sortConfig: orderFiltering.sortConfig,
    setSortConfig: orderFiltering.setSortConfig,
    filterValue: orderFiltering.filterValue,
    setFilterValue: orderFiltering.setFilterValue,
    isLoadingOptions,
    safeNumber,
  };
}
