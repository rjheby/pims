import { OrderItem } from "./types";

export const generateEmptyOrderItem = (): OrderItem => {
  // Use timestamp for guaranteed unique ID
  const uniqueId = Date.now();
  console.log('Generating empty order item with ID:', uniqueId);
  
  return {
    id: uniqueId,
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "Pallets", // Default packaging type
    pallets: 0,
    unitCost: 250, // Default unit cost
  };
};

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
