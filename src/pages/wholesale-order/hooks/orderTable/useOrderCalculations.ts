
import { useCallback } from "react";
import { OrderItem, safeNumber } from "../../types";

export function useOrderCalculations() {
  const generateItemName = useCallback((item: OrderItem) => {
    if (!item || !item.species || !item.thickness || !item.length || !item.bundleType) {
      return "";
    }
    
    return `${item.length} ${item.species} ${item.bundleType} ${item.thickness}`;
  }, []);

  const calculateTotalPallets = useCallback((items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  }, []);

  const calculateTotalCost = useCallback((items: OrderItem[]) => {
    return items.reduce(
      (sum, item) => sum + safeNumber(item.pallets) * safeNumber(item.unitCost),
      0
    );
  }, []);

  return {
    generateItemName,
    calculateTotalPallets,
    calculateTotalCost,
  };
}
