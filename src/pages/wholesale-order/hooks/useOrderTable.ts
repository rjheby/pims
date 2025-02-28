
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { OrderItem, initialOptions } from "../types";
import { useOrderActions } from "./orderTable/useOrderActions";
import { useOrderCalculations } from "./orderTable/useOrderCalculations";
import { useOrderFiltering } from "./orderTable/useOrderFiltering";
import { useOrderDisplay } from "./orderTable/useOrderDisplay";
import { useOrderValidation } from "./orderTable/useOrderValidation";

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
    setOptions 
  } = useWholesaleOrder();
  
  const safeOptions = {
    ...initialOptions,
    ...options
  };

  // Import all the smaller hooks in a consistent order to prevent React hook ordering issues
  const orderActions = useOrderActions();
  const orderCalculations = useOrderCalculations();
  const orderFiltering = useOrderFiltering();
  const orderDisplay = useOrderDisplay();
  const { hasValidItems } = useOrderValidation(items);

  // Process items with sorting and filtering
  const processedItems = orderFiltering.applyFiltersAndSorting(items, orderCalculations.generateItemName);

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
    generateItemName: orderCalculations.generateItemName,
    handleUpdateOptions: orderActions.handleUpdateOptions,
    toggleCompressed: orderDisplay.toggleCompressed,
    setNewOption,
    hasValidItems,
    calculateTotalPallets: orderCalculations.calculateTotalPallets,
    calculateTotalCost: orderCalculations.calculateTotalCost,
    sortConfig: orderFiltering.sortConfig,
    setSortConfig: orderFiltering.setSortConfig,
    filterValue: orderFiltering.filterValue,
    setFilterValue: orderFiltering.setFilterValue,
  };
}
