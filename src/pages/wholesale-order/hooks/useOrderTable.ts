
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { OrderItem, emptyOptions, safeNumber } from "../types";
import { useOrderActions } from "./orderTable/useOrderActions";
import { useOrderCalculations } from "./orderTable/useOrderCalculations";
import { useOrderFiltering } from "./orderTable/useOrderFiltering";
import { useOrderDisplay } from "./orderTable/useOrderDisplay";
import { useOrderValidation } from "./orderTable/useOrderValidation";
import { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useOrderTable() {
  const { toast } = useToast();
  
  const { 
    items = [], 
    options = emptyOptions,
    isAdmin = false, 
    editingField, 
    editingRowId,
    newOption = "", 
    setNewOption, 
    setEditingField,
    setEditingRowId,
    setItems,
    setOptions,
    loadOptions,
    isLoadingOptions
  } = useWholesaleOrder();
  
  const safeOptions = {
    ...emptyOptions,
    ...options
  };

  const orderActions = useOrderActions();
  const { 
    generateItemName, 
    calculateTotalPallets, 
    calculateTotalCost, 
    calculateTotalPalletEquivalents,
    calculateDetailedItemSummary,
    calculatePackagingSummary,
    generateCompactSummary,
    formatCurrency 
  } = useOrderCalculations();
  const orderFiltering = useOrderFiltering();
  const orderDisplay = useOrderDisplay();
  const { hasValidItems } = useOrderValidation(items);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const processedItems = orderFiltering.applyFiltersAndSorting(items, generateItemName);

  const handleAddItem = useCallback((productData?: Partial<OrderItem>) => {
    try {
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      const newItem: OrderItem = {
        id: uniqueId,
        species: productData?.species || "",
        length: productData?.length || "",
        bundleType: productData?.bundleType || "",
        thickness: productData?.thickness || "",
        packaging: productData?.packaging || "Pallets",
        pallets: productData?.pallets || 0,
        unitCost: productData?.unitCost || 250,
      };
      
      setItems(prevItems => [...prevItems, newItem]);
      
    } catch (error) {
      console.error("Error in handleAddItem:", error);
      throw error;
    }
  }, [setItems]);

  const calculateTotalCapacity = () => {
    return calculateTotalPalletEquivalents(items);
  };

  const getItemSummary = () => {
    return {
      detailedItems: calculateDetailedItemSummary(items),
      packagingSummary: calculatePackagingSummary(items),
      compactSummary: generateCompactSummary(items)
    };
  };

  return {
    items: processedItems,
    options: safeOptions,
    isAdmin,
    editingField,
    editingRowId,
    newOption,
    compressedStates: orderDisplay.compressedStates,
    optionFields: Object.keys(safeOptions) as Array<keyof typeof safeOptions>,
    handleKeyPress: orderActions.handleKeyPress,
    handleUpdateItem: orderActions.handleUpdateItem,
    handleRemoveRow: orderActions.handleRemoveRow,
    handleCopyRow: orderActions.handleCopyRow,
    handleAddItem,
    generateItemName,
    handleUpdateOptions: orderActions.handleUpdateOptions,
    handleStartEditingField: orderActions.handleStartEditingField,
    toggleCompressed: orderDisplay.toggleCompressed,
    setNewOption,
    setEditingRowId,
    hasValidItems,
    calculateTotalPallets,
    calculateTotalCost,
    calculateTotalCapacity,
    calculateTotalPalletEquivalents,
    getItemSummary,
    formatCurrency,
    sortConfig: orderFiltering.sortConfig,
    setSortConfig: orderFiltering.setSortConfig,
    filterValue: orderFiltering.filterValue,
    setFilterValue: orderFiltering.setFilterValue,
    isLoadingOptions,
    safeNumber,
  };
}
