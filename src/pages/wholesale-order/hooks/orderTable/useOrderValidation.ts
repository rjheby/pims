
import { OrderItem } from "../../types";

export function useOrderValidation(items: OrderItem[]) {
  const hasValidItems = items.some(item => {
    return item.species && 
           item.length && 
           item.bundleType && 
           item.thickness && 
           item.pallets > 0;
  });

  return {
    hasValidItems
  };
}
