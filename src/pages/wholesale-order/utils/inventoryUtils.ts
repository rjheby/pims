import { supabase } from "@/integrations/supabase/client";
import { OrderItem, safeNumber } from "../types";

export const updateInventoryFromOrder = async (orderItems: OrderItem[]) => {
  try {
    const itemGroups: Record<string, OrderItem> = {};
    
    orderItems.forEach(item => {
      if (!item.species || !item.length || !item.bundleType || !item.thickness) {
        return;
      }
      
      const key = `${item.species}-${item.length}-${item.bundleType}-${item.thickness}`;
      
      if (itemGroups[key]) {
        itemGroups[key].pallets = safeNumber(itemGroups[key].pallets) + safeNumber(item.pallets);
      } else {
        itemGroups[key] = { ...item };
      }
    });
    
    let successCount = 0;
    let totalGroups = Object.keys(itemGroups).length;
    let errors: any[] = [];
    
    for (const key in itemGroups) {
      const item = itemGroups[key];
      
      try {
        const { data: productData, error: productError } = await supabase
          .from('wood_products')
          .select('id')
          .eq('species', item.species)
          .eq('length', item.length)
          .eq('bundle_type', item.bundleType)
          .eq('thickness', item.thickness)
          .single();
        
        if (productError) {
          errors.push(productError);
          continue;
        }
        
        if (!productData) {
          errors.push(new Error(`Product not found for ${key}`));
          continue;
        }
        
        const productId = productData.id;
        
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('wood_product_id', productId)
          .single();
        
        if (inventoryError && inventoryError.code !== 'PGRST116') {
          errors.push(inventoryError);
          continue;
        }
        
        const palletsToAdjust = safeNumber(item.pallets);
        
        if (inventoryData) {
          let updateData: Record<string, any> = {
            last_updated: new Date().toISOString()
          };
          
          if (palletsToAdjust > 0) {
            updateData.total_pallets = safeNumber(inventoryData.total_pallets) + palletsToAdjust;
            updateData.pallets_available = safeNumber(inventoryData.pallets_available) + palletsToAdjust;
          } else if (palletsToAdjust < 0) {
            const absAdjustment = Math.abs(palletsToAdjust);
            updateData.total_pallets = Math.max(0, safeNumber(inventoryData.total_pallets) - absAdjustment);
            updateData.pallets_available = Math.max(0, safeNumber(inventoryData.pallets_available) - absAdjustment);
            if (safeNumber(inventoryData.pallets_available) < absAdjustment) {
              console.warn(`Tried to remove ${absAdjustment} pallets but only ${inventoryData.pallets_available} available for ${key}`);
            }
          } else {
            successCount++;
            continue;
          }
          
          const { error: updateError } = await supabase
            .from('inventory_items')
            .update(updateData)
            .eq('wood_product_id', productId);
          
          if (updateError) {
            errors.push(updateError);
            continue;
          }
        } else if (palletsToAdjust > 0) {
          const { error: createError } = await supabase
            .from('inventory_items')
            .insert({
              wood_product_id: productId,
              total_pallets: palletsToAdjust,
              pallets_available: palletsToAdjust,
              pallets_allocated: 0,
              last_updated: new Date().toISOString()
            });
          
          if (createError) {
            errors.push(createError);
            continue;
          }
        } else if (palletsToAdjust < 0) {
          console.warn(`Tried to remove ${Math.abs(palletsToAdjust)} pallets but no inventory exists for ${key}`);
        }
        
        successCount++;
      } catch (err) {
        errors.push(err);
      }
    }
    
    if (successCount === totalGroups) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `Updated ${successCount} of ${totalGroups} products. Errors: ${errors.map(e => e.message || e).join(', ')}` 
      };
    }
  } catch (err) {
    return { success: false, error: err };
  }
};
