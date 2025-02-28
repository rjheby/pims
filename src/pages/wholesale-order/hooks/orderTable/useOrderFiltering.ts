
import { useState } from "react";
import { OrderItem } from "../../types";

export function useOrderFiltering() {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterValue, setFilterValue] = useState("");

  const applyFiltersAndSorting = (items: OrderItem[], generateItemName: (item: OrderItem) => string) => {
    let processedItems = [...items];

    if (sortConfig) {
      processedItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof OrderItem];
        const bValue = b[sortConfig.key as keyof OrderItem];

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        // Handle number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        // When comparing different types or nulls
        if (!aValue && bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue && !bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        return 0;
      });
    }

    if (filterValue) {
      processedItems = processedItems.filter(item => {
        const searchLower = filterValue.toLowerCase();
        
        // Check main properties
        if (
          (item.species && item.species.toLowerCase().includes(searchLower)) ||
          (item.length && item.length.toLowerCase().includes(searchLower)) ||
          (item.bundleType && item.bundleType.toLowerCase().includes(searchLower)) ||
          (item.thickness && item.thickness.toLowerCase().includes(searchLower)) ||
          (item.packaging && item.packaging.toLowerCase().includes(searchLower))
        ) {
          return true;
        }
        
        // Check numeric values as strings
        if (
          item.pallets?.toString().includes(searchLower) ||
          item.unitCost?.toString().includes(searchLower)
        ) {
          return true;
        }
        
        // Check the generated name
        const name = generateItemName(item).toLowerCase();
        if (name.includes(searchLower)) {
          return true;
        }
        
        return false;
      });
    }

    return processedItems;
  };

  return {
    sortConfig,
    setSortConfig,
    filterValue,
    setFilterValue,
    applyFiltersAndSorting
  };
}
