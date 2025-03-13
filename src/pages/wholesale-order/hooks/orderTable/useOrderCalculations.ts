
import { OrderItem, safeNumber } from "../../types";

// Object defining the packaging type conversions
export const PACKAGING_CONVERSIONS = {
  'Pallets': { unitsPerPallet: 1, palletEquivalent: 1 },
  'Bundles': { unitsPerPallet: 75, palletEquivalent: 1/75 },
  'Boxes (Plastic)': { unitsPerPallet: 30, palletEquivalent: 1/30 },
  '12x10" Boxes': { unitsPerPallet: 60, palletEquivalent: 1/60 },
  '16x12" Boxes': { unitsPerPallet: 48, palletEquivalent: 1/48 },
  'Packages': { unitsPerPallet: 500, palletEquivalent: 1/500 },
  'Crates': { unitsPerPallet: 1, palletEquivalent: 1.5 },
  'Boxes': { unitsPerPallet: 30, palletEquivalent: 1/30 } // Legacy fallback
};

// Helper function to get packaging conversion info
export const getPackagingConversion = (packagingType: string) => {
  const packagingKey = Object.keys(PACKAGING_CONVERSIONS).find(key => 
    packagingType.includes(key)
  );
  
  return packagingKey 
    ? PACKAGING_CONVERSIONS[packagingKey as keyof typeof PACKAGING_CONVERSIONS] 
    : PACKAGING_CONVERSIONS['Pallets']; // Default to pallets
};

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
      const packaging = item.packaging || 'Pallets';
      const quantity = safeNumber(item.pallets);
      const conversion = getPackagingConversion(packaging);
      
      return total + (quantity * conversion.palletEquivalent);
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
    safeNumber,
    getPackagingConversion
  };
}
