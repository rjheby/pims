
import { OrderItem } from "./types";

export function generateEmptyOrderItem(): OrderItem {
  return {
    id: Date.now(),
    bundleType: "",
    length: "",
    packaging: "",
    pallets: 0,
    species: "",
    thickness: "",
    unitCost: 0,
  };
}

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
