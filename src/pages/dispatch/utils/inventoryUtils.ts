
// Inventory utility functions for capacity planning and calculations

// Constants for packaging conversions
export const PACKAGING_CONVERSIONS = {
  WOOD_PALLET: 1.0,           // Base unit
  WOOD_BUNDLE: 0.2,           // 5 bundles = 1 pallet
  RETAIL_PACKAGE_SMALL: 0.05, // 20 small packages = 1 pallet
  RETAIL_PACKAGE_MEDIUM: 0.1, // 10 medium packages = 1 pallet
  RETAIL_PACKAGE_LARGE: 0.2,  // 5 large packages = 1 pallet
  BOX: 0.025                  // 40 boxes = 1 pallet
};

// Types for capacity calculations
export type PackagingType = keyof typeof PACKAGING_CONVERSIONS;

export interface CapacityItem {
  type: PackagingType;
  quantity: number;
}

export interface DriverCapacity {
  maxPalletEquivalents: number;
  currentItems: CapacityItem[];
}

/**
 * Calculates total pallet equivalents for a set of items
 */
export const calculatePalletEquivalents = (items: CapacityItem[]): number => {
  return items.reduce((total, item) => {
    const conversionFactor = PACKAGING_CONVERSIONS[item.type] || 0;
    return total + (item.quantity * conversionFactor);
  }, 0);
};

/**
 * Calculates capacity percentage for a driver
 */
export const calculateCapacityPercentage = (driverCapacity: DriverCapacity): number => {
  const totalPalletEquivalents = calculatePalletEquivalents(driverCapacity.currentItems);
  if (driverCapacity.maxPalletEquivalents <= 0) return 100; // Avoid division by zero
  
  const percentage = (totalPalletEquivalents / driverCapacity.maxPalletEquivalents) * 100;
  return Math.min(Math.round(percentage), 100); // Cap at 100% and round
};

/**
 * Determines if adding items would exceed capacity
 */
export const wouldExceedCapacity = (
  driverCapacity: DriverCapacity,
  additionalItems: CapacityItem[]
): boolean => {
  const currentPalletEquivalents = calculatePalletEquivalents(driverCapacity.currentItems);
  const additionalPalletEquivalents = calculatePalletEquivalents(additionalItems);
  const totalPalletEquivalents = currentPalletEquivalents + additionalPalletEquivalents;
  
  return totalPalletEquivalents > driverCapacity.maxPalletEquivalents;
};

/**
 * Calculates remaining capacity for a driver
 */
export const calculateRemainingCapacity = (driverCapacity: DriverCapacity): number => {
  const currentPalletEquivalents = calculatePalletEquivalents(driverCapacity.currentItems);
  return Math.max(0, driverCapacity.maxPalletEquivalents - currentPalletEquivalents);
};

/**
 * Converts raw items string to capacity items
 */
export const parseItemsToCapacityItems = (
  itemsString: string | null
): CapacityItem[] => {
  if (!itemsString) return [];
  
  const items: CapacityItem[] = [];
  const itemsArray = itemsString.split(',').map(item => item.trim());
  
  itemsArray.forEach(item => {
    const match = item.match(/^(\d+)x\s+(.+?)(?:\s+@\$(\d+\.\d+))?$/);
    if (match) {
      const quantity = parseInt(match[1]);
      const name = match[2].trim().toUpperCase();
      
      // Determine packaging type based on item name
      let type: PackagingType = 'RETAIL_PACKAGE_MEDIUM'; // Default
      
      if (name.includes('PALLET')) {
        type = 'WOOD_PALLET';
      } else if (name.includes('BUNDLE')) {
        type = 'WOOD_BUNDLE';
      } else if (name.includes('BOX')) {
        type = 'BOX';
      } else if (name.includes('SMALL')) {
        type = 'RETAIL_PACKAGE_SMALL';
      } else if (name.includes('LARGE')) {
        type = 'RETAIL_PACKAGE_LARGE';
      }
      
      items.push({ type, quantity });
    }
  });
  
  return items;
};

/**
 * Estimates delivery duration based on items quantity and type
 */
export const estimateDeliveryDuration = (items: CapacityItem[]): number => {
  // Base time in minutes for any delivery
  const baseTime = 15;
  
  // Additional time based on pallet equivalents
  const palletEquivalents = calculatePalletEquivalents(items);
  const additionalTime = Math.ceil(palletEquivalents * 10); // 10 minutes per pallet equivalent
  
  return baseTime + additionalTime;
};
