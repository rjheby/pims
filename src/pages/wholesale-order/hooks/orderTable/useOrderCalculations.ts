
import { OrderItem } from "../../types";
import { useWholesaleOrder } from "../../context/WholesaleOrderContext";

export function useOrderCalculations() {
  const { items = [] } = useWholesaleOrder();

  const calculateTotalPallets = () => {
    return items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  };

  const generateItemName = (item: OrderItem) => {
    if (!item) return "New Item";
    const parts = [];

    if (item.pallets && item.packaging) {
      parts.push(`${item.pallets} ${item.packaging} of`);
    }

    if (item.species) parts.push(item.species);
    if (item.length) parts.push(item.length);
    if (item.bundleType) parts.push(item.bundleType);
    if (item.thickness) parts.push(item.thickness);

    return parts.join(" ") || "New Item";
  };

  return {
    calculateTotalPallets,
    calculateTotalCost,
    generateItemName
  };
}
