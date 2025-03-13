
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
    calculateCapacityPercentage,
    calculateItemGroups,
    getPackagingConversion
  } = useOrderCalculations();

  const totalPallets = calculateTotalPallets(items);
  const totalCost = calculateTotalCost(items);
  const totalEquivalentPallets = calculateTotalPalletEquivalents(items);
  const capacityPercentage = calculateCapacityPercentage(items);
  const maxLoad = 24;
  const itemGroups = calculateItemGroups(items);

  // Check if we have different packaging types in the order
  const packagingTypes = new Set(items.map(item => item.packaging));
  const hasMultiplePackagingTypes = packagingTypes.size > 1;
  
  // Create an object to explain each packaging type's conversion ratio
  const packagingConversions = {};
  packagingTypes.forEach(type => {
    if (type) {
      const conversion = getPackagingConversion(type);
      packagingConversions[type] = conversion;
    }
  });

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

        {hasMultiplePackagingTypes && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            <p>Note: Capacity calculations consider packaging types differently:</p>
            {Array.from(packagingTypes).filter(Boolean).map(type => {
              const conversion = getPackagingConversion(type);
              const ratio = conversion.palletEquivalent === 1 
                ? "1 pallet" 
                : conversion.palletEquivalent > 1 
                  ? `${conversion.palletEquivalent} pallets` 
                  : `1/${1/conversion.palletEquivalent} of a pallet`;
              
              return (
                <p key={type}>• Each {type} = {ratio} ({conversion.palletEquivalent * 100 / 24}% of truck capacity)</p>
              );
            })}
          </div>
        )}

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
            Warning: Load exceeds truck capacity by {(totalEquivalentPallets - maxLoad).toFixed(2)} pallets
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
