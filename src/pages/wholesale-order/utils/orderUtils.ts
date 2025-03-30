
import { OrderItem } from "../types/orderTypes";
import type { SupabaseClient } from "@supabase/supabase-js";

// Utility functions for OrderTable
export const safeNumber = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

export const calculateItemTotal = (item: OrderItem): number => {
  return safeNumber(item.pallets) * safeNumber(item.unitCost);
};

export const serializeOrderItems = (items: OrderItem[]): OrderItem[] => {
  return items.map(item => ({
    ...item,
    pallets: safeNumber(item.pallets),
    unitCost: safeNumber(item.unitCost)
  }));
};

// Helper function to generate an empty OrderItem with a unique ID
export const generateEmptyOrderItem = (): OrderItem => {
  const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
  return {
    id: uniqueId,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets",
    pallets: 1,
    unitCost: 250
  };
};
