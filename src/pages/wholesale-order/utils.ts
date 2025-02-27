
import { OrderItem } from "./types";
import { toast } from "@/hooks/use-toast";

export const addRow = (items: OrderItem[]) => {
  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const newPallets = 0; // Default for new row

  if (totalPallets + newPallets > 24) {
    toast({
      title: "Warning",
      description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
      variant: "destructive",
    });
    return null;
  }

  return {
    id: items.length + 1,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets",
    pallets: 0,
  };
};

// Format currency to USD
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format date to readable format
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
