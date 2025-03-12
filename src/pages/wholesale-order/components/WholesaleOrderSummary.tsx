
import { useOrderCalculations } from "../hooks/orderTable/useOrderCalculations";
import { OrderItem } from "../types";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";

interface WholesaleOrderSummaryProps {
  items: OrderItem[];
}

export function WholesaleOrderSummary({ items }: WholesaleOrderSummaryProps) {
  const { 
    calculateTotalPallets,
    calculateTotalCost,
    calculateTotalPalletEquivalents,
    calculateItemGroups
  } = useOrderCalculations();

  const totalPallets = calculateTotalPallets(items);
  const totalCost = calculateTotalCost(items);
  const totalEquivalentPallets = calculateTotalPalletEquivalents(items);
  const capacityPercentage = (totalEquivalentPallets / 24) * 100;
  const maxLoad = 24;
  const itemGroups = calculateItemGroups(items);

  const renderCustomSummary = () => {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Truck Capacity:</span>
          <span className="text-sm font-medium">
            {capacityPercentage.toFixed(1)}% ({totalEquivalentPallets.toFixed(2)} / {maxLoad} pallets)
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Physical Items:</span>
          <span className="text-sm font-medium">{totalPallets} items</span>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Items Summary:</div>
          {Object.entries(itemGroups).map(([key, quantity]) => (
            <div key={key} className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">{key}:</span>
              <span className="text-sm font-medium">{quantity}</span>
            </div>
          ))}
        </div>
        
        {capacityPercentage > 100 && (
          <div className="text-sm text-amber-600 text-center border-t pt-4">
            Warning: Load exceeds truck capacity by {((capacityPercentage - 100) / 100 * maxLoad).toFixed(2)} pallets
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseOrderSummary 
      items={{
        totalQuantity: totalPallets,
        totalValue: totalCost,
        quantityByPackaging: itemGroups
      }}
      renderCustomSummary={renderCustomSummary}
    />
  );
}
