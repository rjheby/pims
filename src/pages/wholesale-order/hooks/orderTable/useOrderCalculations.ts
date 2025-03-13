
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

  // Calculate total pallet equivalents based on the updated capacities:
  // - Each pallet is 1/24 of truck capacity
  // - Each 12x10" box is 1/1440 of truck capacity (1/60 of a pallet)
  const calculateTotalPalletEquivalents = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      if (item.packaging === "12x10\" Boxes") {
        // 1 box = 1/1440 of truck capacity = 1/60 of a pallet
        return total + (safeNumber(item.pallets) / 60);
      }
      return total + safeNumber(item.pallets);
    }, 0);
  };

  const calculateCapacityPercentage = (items: OrderItem[]): number => {
    const totalEquivalents = calculateTotalPalletEquivalents(items);
    const maxCapacity = 24; // Max truck capacity in pallets
    return (totalEquivalents / maxCapacity) * 100;
  };

  // Group items by attributes for summary
  const calculateItemGroups = (items: OrderItem[]) => {
    const groups: Record<string, number> = {};
    
    items.forEach(item => {
      const key = [
        item.species,
        item.bundleType,
        item.length,
        item.thickness
      ].filter(Boolean).join(' - ');
      
      if (groups[key]) {
        groups[key] += safeNumber(item.pallets);
      } else {
        groups[key] = safeNumber(item.pallets);
      }
    });
    
    return groups;
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
    calculateCapacityPercentage,
    calculateItemGroups,
    safeNumber
  };
}
