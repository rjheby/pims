
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

  // Calculate total pallet equivalents based on packaging type
  // Each packaging type has its own capacity relationship to the truck
  const calculateTotalPalletEquivalents = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      // Different packaging types have different equivalents
      switch(item.packaging) {
        case "12x10\" Boxes":
          // 1 box = 1/1440 of truck capacity = 1/60 of a pallet
          return total + (safeNumber(item.pallets) / 60);
        case "Crates":
          // A crate is counted as 1.5 pallets for capacity
          return total + (safeNumber(item.pallets) * 1.5);
        case "Boxes":
          // Standard boxes are 1/30 of a pallet
          return total + (safeNumber(item.pallets) / 30);
        case "Pallets":
        default:
          // Standard pallet is 1 pallet equivalent
          return total + safeNumber(item.pallets);
      }
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
