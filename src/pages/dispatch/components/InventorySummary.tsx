
import React from 'react';
import { InventoryTotals, normalizeProductName } from '../utils/inventoryUtils';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';

interface InventorySummaryProps {
  inventoryTotals: InventoryTotals;
}

// Fetch product details to display better product names
const useProductDetails = () => {
  return useQuery({
    queryKey: ['firewood-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firewood_products')
        .select('*')
        .order('item_name');
        
      if (error) throw error;
      return data || [];
    }
  });
};

export function InventorySummary({ inventoryTotals }: InventorySummaryProps) {
  const { data: products, isLoading } = useProductDetails();
  const hasItems = Object.keys(inventoryTotals).length > 0;
  
  if (!hasItems) return null;
  
  // Helper function to find product name from item description
  const getProductDisplayName = (itemDescription: string) => {
    if (!products || isLoading) return normalizeProductName(itemDescription);
    
    // Parse format like "2x Firewood - 1/4 cord"
    const match = itemDescription.match(/^(\d+)x\s+(.+)$/);
    const quantity = match ? match[1] : "1";
    const description = match ? match[2] : itemDescription;
    
    // Try to find a matching product by name or full name
    const product = products.find(p => 
      description.includes(p.item_name) || 
      (p.item_full_name && description.includes(p.item_full_name))
    );
    
    // Return formatted display name
    if (product) {
      // Use item_name as the common name for consistent display
      return `${quantity}x ${product.item_name}`;
    }
    
    // If no match found, normalize the name for consistent display
    return normalizeProductName(itemDescription);
  };
  
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-medium mb-2">Total Inventory Items:</h4>
      <div className="space-y-1">
        {Object.entries(inventoryTotals).map(([item, count]) => (
          <div key={item} className="flex justify-between text-sm">
            <span>{getProductDisplayName(item)}</span>
            <span className="font-medium">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
