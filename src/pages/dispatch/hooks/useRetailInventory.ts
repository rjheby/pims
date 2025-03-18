
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  is_popular?: boolean;
  popularity_rank?: number;
}

export interface InventoryItem {
  id: string;
  product_id?: string;
  firewood_product_id?: string | number; // Support both string and number types
  packages_available?: number;
  quantity?: number; // Added to track selected quantity
  custom_price?: number; // Added for price customization
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
  is_popular?: boolean;
  popularity_rank?: number;
}

// Add popularity ordering for common products
const POPULAR_PRODUCTS = [
  "Standard Split Bundles",
  "Pizza Split Bundles", 
  "Boxes of Mixed Hardwood",
  "Bundle of Kindling"
];

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
        // Fetch retail inventory with pricing information
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('retail_inventory')
          .select('*, firewood_product_id');

        if (inventoryError) {
          throw new Error(`Error fetching retail inventory: ${inventoryError.message}`);
        }

        // Convert any numeric ID to string for consistency in the component
        const formattedInventory = (inventoryData || []).map((item: any) => ({
          ...item,
          quantity: 1, // Initialize quantity to 1 for each item
        }));

        setRetailInventory(formattedInventory);

        // Fetch firewood products with more details
        const { data: productsData, error: productsError } = await supabase
          .from('firewood_products')
          .select('*, product_pricing(unit_price)');

        if (productsError) {
          throw new Error(`Error fetching firewood products: ${productsError.message}`);
        }

        // Convert firewood_products to Product format with pricing
        const formattedProducts = (productsData || []).map((product: FirewoodProduct & { product_pricing?: any[] }) => {
          // Get the price from the first pricing tier if available
          const price = product.product_pricing && 
                       product.product_pricing.length > 0 ? 
                       product.product_pricing[0]?.unit_price : undefined;
          
          // Determine popularity based on name
          const popularityIndex = POPULAR_PRODUCTS.findIndex(
            name => product.item_name?.includes(name) || product.item_full_name?.includes(name)
          );
          
          const isPopular = popularityIndex >= 0;
          
          return {
            id: String(product.id), // Convert number to string
            name: product.item_name,
            description: product.item_full_name,
            sku: product.product_type,
            price: price,
            is_popular: isPopular,
            popularity_rank: isPopular ? popularityIndex : 999 // Use index from popular products array or a high number
          };
        });

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
      // Handle both string and number product IDs
      const productId = item.firewood_product_id !== undefined 
        ? String(item.firewood_product_id) 
        : item.product_id !== undefined 
          ? String(item.product_id) 
          : undefined;
      
      const product = productId 
        ? firewoodProducts.find(p => String(p.id) === productId)
        : undefined;
      
      return {
        ...item,
        product
      };
    })
    .filter(item => item.product) // Only return items that have associated products
    .sort((a, b) => {
      // Sort by popularity_rank (lower = more popular)
      const rankA = a.product?.popularity_rank || 999;
      const rankB = b.product?.popularity_rank || 999;
      return rankA - rankB;
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
