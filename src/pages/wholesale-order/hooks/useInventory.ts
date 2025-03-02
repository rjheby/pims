
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, WoodProduct, FirewoodProduct, ProductConversion } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useInventory() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [woodProducts, setWoodProducts] = useState<WoodProduct[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<FirewoodProduct[]>([]);
  const [productConversions, setProductConversions] = useState<ProductConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch wood products
      const { data: woodProductsData, error: woodProductsError } = await supabase
        .from("wood_products")
        .select("*");
      
      if (woodProductsError) throw woodProductsError;
      
      // Fetch firewood products
      const { data: firewoodProductsData, error: firewoodProductsError } = await supabase
        .from("firewood_products")
        .select("*");
      
      if (firewoodProductsError) throw firewoodProductsError;
      
      // We'll need to create these tables in the database
      // For now, set empty arrays for inventory items and product conversions
      // as these tables don't exist yet
      
      setWoodProducts(woodProductsData || []);
      setFirewoodProducts(firewoodProductsData || []);
      setInventoryItems([]);
      setProductConversions([]);
      
      console.log("Loaded wood products:", woodProductsData?.length || 0);
      console.log("Loaded firewood products:", firewoodProductsData?.length || 0);
      
    } catch (err: any) {
      console.error("Error fetching inventory data:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const getRetailProductsFromWholesale = useCallback((woodProductId: string): {
    firewoodProduct: FirewoodProduct,
    conversionRatio: number
  }[] => {
    const conversions = productConversions.filter(pc => pc.wood_product_id === woodProductId);
    return conversions.map(conversion => {
      const firewoodProduct = firewoodProducts.find(fp => fp.id === conversion.firewood_product_id);
      if (!firewoodProduct) {
        throw new Error(`Firewood product not found for conversion ${conversion.id}`);
      }
      return {
        firewoodProduct,
        conversionRatio: conversion.conversion_ratio
      };
    });
  }, [productConversions, firewoodProducts]);

  const getWholesaleProductForRetail = useCallback((firewoodProductId: number): {
    woodProduct: WoodProduct,
    conversionRatio: number
  }[] => {
    const conversions = productConversions.filter(pc => pc.firewood_product_id === firewoodProductId);
    return conversions.map(conversion => {
      const woodProduct = woodProducts.find(wp => wp.id === conversion.wood_product_id);
      if (!woodProduct) {
        throw new Error(`Wood product not found for conversion ${conversion.id}`);
      }
      return {
        woodProduct,
        conversionRatio: conversion.conversion_ratio
      };
    });
  }, [productConversions, woodProducts]);

  return {
    inventoryItems,
    woodProducts,
    firewoodProducts,
    productConversions,
    loading,
    error,
    refreshInventory: fetchInventoryData,
    getRetailProductsFromWholesale,
    getWholesaleProductForRetail
  };
}
