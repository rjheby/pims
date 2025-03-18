
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

interface FirewoodProduct {
  id: number | string;
  item_name: string;
  item_full_name: string;
  species?: string;
  length?: string;
  split_size?: string;
  package_size?: string;
  product_type?: string;
  minimum_quantity?: number;
  image_reference?: string;
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

        // Fetch firewood products
        const { data: productsData, error: productsError } = await supabase
          .from('firewood_products')
          .select('*');

        if (productsError) {
          throw new Error(`Error fetching firewood products: ${productsError.message}`);
        }

        // Convert firewood_products to Product format
        const formattedProducts = (productsData || []).map((product: FirewoodProduct) => ({
          id: String(product.id), // Convert number to string
          name: product.item_name,
          description: product.item_full_name,
          sku: product.product_type
        }));

        setFirewoodProducts(formattedProducts);
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
      const productId = typeof item.product_id === 'string' 
        ? item.product_id 
        : item.product_id !== undefined ? String(item.product_id) : undefined;
      
      const product = firewoodProducts.find(p => p.id === productId);
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
