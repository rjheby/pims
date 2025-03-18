
import React from 'react';
import { InventoryTotals } from '../utils/inventoryUtils';

interface InventorySummaryProps {
  inventoryTotals: InventoryTotals;
}

export function InventorySummary({ inventoryTotals }: InventorySummaryProps) {
  const hasItems = Object.keys(inventoryTotals).length > 0;
  
  if (!hasItems) return null;
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-medium mb-2">Total Inventory Items:</h4>
      <div className="space-y-1">
        {Object.entries(inventoryTotals).map(([item, count]) => (
          <div key={item} className="flex justify-between text-sm">
            <span>{item}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
