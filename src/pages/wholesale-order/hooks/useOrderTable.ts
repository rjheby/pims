
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { OrderItem, initialOptions } from "../types";
import { useOrderActions } from "./orderTable/useOrderActions";
import { useOrderCalculations } from "./orderTable/useOrderCalculations";
import { useOrderFiltering } from "./orderTable/useOrderFiltering";
import { useOrderDisplay } from "./orderTable/useOrderDisplay";
import { useOrderValidation } from "./orderTable/useOrderValidation";

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
  
  const safeOptions = {
    ...initialOptions,
    ...options
  };

  // Import all the smaller hooks
  const {
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    handleUpdateOptions,
  } = useOrderActions();

  const {
    calculateTotalPallets,
    calculateTotalCost,
    generateItemName
  } = useOrderCalculations();

  const {
    sortConfig,
    setSortConfig,
    filterValue,
    setFilterValue,
    applyFiltersAndSorting
  } = useOrderFiltering();

  const {
    compressedStates,
    toggleCompressed
  } = useOrderDisplay();

  const { hasValidItems } = useOrderValidation(items);

  // Process items with sorting and filtering
  const processedItems = applyFiltersAndSorting(items, generateItemName);

  // Return a consolidated object with all the functionality
  return {
    items: processedItems,
    options: safeOptions,
    isAdmin,
    editingField,
    newOption,
    compressedStates,
    optionFields: Object.keys(safeOptions) as Array<keyof typeof safeOptions>,
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
