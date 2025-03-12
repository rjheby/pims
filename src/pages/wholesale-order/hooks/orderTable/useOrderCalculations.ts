
import { OrderItem, safeNumber } from "../../types";

export function useOrderCalculations() {
  const calculateTotalQuantity = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + safeNumber(item.pallets), 0);
  };

  const calculateTotalCost = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      return total + (safeNumber(item.pallets) * safeNumber(item.unitCost));
    }, 0);
  };

  // Added function for calculating total pallets (alias for calculateTotalQuantity)
  const calculateTotalPallets = (items: OrderItem[]): number => {
    return calculateTotalQuantity(items);
  };

  // Calculate total pallet equivalents considering that 60 12x10" boxes = 1 pallet
  const calculateTotalPalletEquivalents = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      if (item.packaging === "12x10\" Boxes") {
        return total + (safeNumber(item.pallets) / 60);
      }
      return total + safeNumber(item.pallets);
    }, 0);
  };

  // Added function to generate item name
  const generateItemName = (item: OrderItem): string => {
    const nameParts = [
      item.species,
      item.length,
      item.bundleType,
      item.thickness
    ].filter(Boolean);
    
    return nameParts.join(' - ');
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  return {
    calculateTotalQuantity,
    calculateTotalCost,
    formatCurrency,
    generateItemName,
    calculateTotalPallets,
    calculateTotalPalletEquivalents,
    safeNumber
  };
}
