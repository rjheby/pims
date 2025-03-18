
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
}

export interface InventoryItem {
  id: string;
  product_id?: string;
  packages_available?: number;
  product?: Product;
}

export const useRetailInventory = () => {
  const [retailInventory, setRetailInventory] = useState<InventoryItem[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch retail inventory and firewood products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch retail inventory
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('retail_inventory')
          .select('*');

        if (inventoryError) {
          throw new Error(`Error fetching retail inventory: ${inventoryError.message}`);
        }

        setRetailInventory(inventoryData || []);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('type', 'FIREWOOD');

        if (productsError) {
          throw new Error(`Error fetching firewood products: ${productsError.message}`);
        }

        setFirewoodProducts(productsData || []);
      } catch (err: any) {
        console.error('Error in useRetailInventory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Join inventory items with their associated products
  const getInventoryWithProductDetails = () => {
    return retailInventory.map(item => {
      const product = firewoodProducts.find(p => p.id === item.product_id);
      return {
        ...item,
        product
      };
    });
  };

  return {
    retailInventory,
    firewoodProducts,
    loading,
    error,
    getInventoryWithProductDetails
  };
};
