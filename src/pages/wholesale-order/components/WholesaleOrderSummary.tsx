
import { useOrderCalculations } from "../hooks/orderTable/useOrderCalculations";
import { OrderItem } from "../types";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { AlertTriangle } from "lucide-react";

interface WholesaleOrderSummaryProps {
  items: OrderItem[];
}

export function WholesaleOrderSummary({ items }: WholesaleOrderSummaryProps) {
  const { 
    calculateTotalPallets,
    calculateTotalCost,
    calculateTotalPalletEquivalents,
    calculateCapacityPercentage,
    calculateDetailedItemSummary,
    calculatePackagingSummary,
    generateCompactSummary,
    getPackagingConversion,
    isOverCapacity,
    calculateRemainingCapacity
  } = useOrderCalculations();

  const totalPallets = calculateTotalPallets(items);
  const totalCost = calculateTotalCost(items);
  const totalEquivalentPallets = calculateTotalPalletEquivalents(items);
  const capacityPercentage = calculateCapacityPercentage(items);
  const remainingCapacity = calculateRemainingCapacity(items);
  const overCapacity = isOverCapacity(items);
  const maxLoad = 24;
  const detailedItemSummary = calculateDetailedItemSummary(items);
  const packagingSummary = calculatePackagingSummary(items);
  const compactSummary = generateCompactSummary(items);

  // Check if we have different packaging types in the order
  const packagingTypes = new Set(items.map(item => item.packaging));
  const hasMultiplePackagingTypes = packagingTypes.size > 1;
  
  // Create an object to explain each packaging type's conversion ratio
  const packagingConversions: Record<string, any> = {};
  packagingTypes.forEach(type => {
    if (type) {
      const conversion = getPackagingConversion(type);
      packagingConversions[type] = conversion;
    }
  });

  // Generate a more user-friendly detailed summary for display
  const formattedDetailedSummary: Record<string, number> = {};
  Object.entries(detailedItemSummary).forEach(([key, count]) => {
    // Parse the key into its components
    const [species, bundleType, packaging, length, thickness] = key.split(' - ');
    
    // Create a more readable format
    const readableKey = [
      species,
      bundleType,
      length,
      thickness.includes('Split') ? thickness : thickness + ' Split'
    ].filter(Boolean).join(' - ');
    
    // Add the packaging type if it's not Pallets
    const displayKey = packaging !== 'Pallets' 
      ? `${readableKey} - ${packaging}` 
      : readableKey;
    
    formattedDetailedSummary[displayKey] = count;
  });

  const renderCustomSummary = () => {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
        {/* Compact summary display */}
        <div className="text-sm font-medium bg-amber-50 p-2 rounded-md">
          Items: {compactSummary}
        </div>
        
        {/* Detailed Items Summary */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Items Summary:</div>
          <div className="bg-gray-50 p-3 rounded-md">
            {Object.entries(formattedDetailedSummary).map(([key, quantity]) => (
              <div key={key} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{key}:</span>
                <span className="text-sm font-medium">{quantity}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Capacity Information */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Truck Capacity:</span>
          <span className={`text-sm font-medium ${overCapacity ? 'text-amber-600' : ''}`}>
            {capacityPercentage.toFixed(1)}% ({totalEquivalentPallets.toFixed(2)} / {maxLoad} pallets)
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining Capacity:</span>
          <span className="text-sm font-medium">
            {remainingCapacity.toFixed(2)} pallets
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
                <p key={type}>• Each {type} = {ratio} ({(conversion.palletEquivalent * 100 / 24).toFixed(1)}% of truck capacity)</p>
              );
            })}
          </div>
        )}
        
        {overCapacity && (
          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>
              Warning: Load exceeds truck capacity by {(totalEquivalentPallets - maxLoad).toFixed(2)} pallets
            </span>
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
        quantityByPackaging: packagingSummary
      }}
      renderCustomSummary={renderCustomSummary}
    />
  );
}
