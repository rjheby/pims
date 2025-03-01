
import { OrderItem, safeNumber } from "../../types";

export function useOrderValidation(items: OrderItem[]) {
  const hasValidItems = items.some(item => {
    return item.species && 
           item.length && 
           item.bundleType && 
           item.thickness && 
           safeNumber(item.pallets) > 0;
  });

  return {
    hasValidItems
  };
}
