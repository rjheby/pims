
import { supabase } from "@/integrations/supabase/client";
import { OrderItem, safeNumber, supabaseTable } from "../types";

interface UpdateResult {
  success: boolean;
  error?: any;
  updatedProducts: string[];
}

/**
 * Updates inventory based on submitted order items
 * 
 * @param items Order items from the submitted wholesale order
 * @returns Result of the update operation
 */
export async function updateInventoryFromOrder(items: OrderItem[]): Promise<UpdateResult> {
  console.log('Updating inventory from order items:', items);
  
  const result: UpdateResult = {
    success: true,
    updatedProducts: []
  };
  
  // Group the items by species, length, bundleType, and thickness to match with wood_products
  const itemsByAttributes: Record<string, number> = {};
  
  items.forEach(item => {
    if (!item.species || !item.length || !item.bundleType || !item.thickness || !item.pallets) {
      return; // Skip incomplete items
    }
    
    const key = `${item.species}|${item.length}|${item.bundleType}|${item.thickness}`;
    itemsByAttributes[key] = (itemsByAttributes[key] || 0) + safeNumber(item.pallets);
  });
  
  // Process each unique product type
  for (const [attributeKey, palletCount] of Object.entries(itemsByAttributes)) {
    const [species, length, bundleType, thickness] = attributeKey.split('|');
    
    try {
      // Find matching wood product in the database
      const { data: woodProducts, error: productError } = await supabase
        .from(supabaseTable.wood_products)
        .select('id')
        .eq('species', species)
        .eq('length', length)
        .eq('bundle_type', bundleType)
        .eq('thickness', thickness);
      
      if (productError) {
        console.error('Error finding wood product:', productError);
        result.success = false;
        result.error = productError;
        continue;
      }
      
      if (!woodProducts || woodProducts.length === 0) {
        console.warn(`No matching wood product found for ${attributeKey}`);
        continue;
      }
      
      const woodProductId = woodProducts[0].id;
      
      // Check if inventory item exists
      const { data: inventoryItems, error: inventoryError } = await supabase
        .from(supabaseTable.inventory_items)
        .select('*')
        .eq('wood_product_id', woodProductId);
      
      if (inventoryError) {
        console.error('Error checking inventory:', inventoryError);
        result.success = false;
        result.error = inventoryError;
        continue;
      }
      
      if (inventoryItems && inventoryItems.length > 0) {
        // Update existing inventory item
        const inventoryItem = inventoryItems[0];
        const newPalletsAvailable = safeNumber(inventoryItem.pallets_available) + palletCount;
        const newTotalPallets = safeNumber(inventoryItem.total_pallets) + palletCount;
        
        const { error: updateError } = await supabase
          .from(supabaseTable.inventory_items)
          .update({ 
            pallets_available: newPalletsAvailable,
            total_pallets: newTotalPallets,
            last_updated: new Date().toISOString()
          })
          .eq('wood_product_id', woodProductId);
        
        if (updateError) {
          console.error('Error updating inventory:', updateError);
          result.success = false;
          result.error = updateError;
          continue;
        }
      } else {
        // Create new inventory item
        const { error: insertError } = await supabase
          .from(supabaseTable.inventory_items)
          .insert([{
            wood_product_id: woodProductId,
            pallets_available: palletCount,
            pallets_allocated: 0,
            total_pallets: palletCount,
            last_updated: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error('Error creating inventory item:', insertError);
          result.success = false;
          result.error = insertError;
          continue;
        }
      }
      
      result.updatedProducts.push(woodProductId);
      
    } catch (err) {
      console.error(`Error processing ${attributeKey}:`, err);
      result.success = false;
      result.error = err;
    }
  }
  
  console.log('Inventory update complete:', result);
  return result;
}
