
import { useState } from "react";
import { useWholesaleInventory } from "@/pages/wholesale-order/hooks/useWholesaleInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package2 } from "lucide-react";
import { WoodProduct } from "@/pages/wholesale-order/types";

export function PalletsAvailableCard() {
  const { wholesaleInventory, woodProducts, loading: inventoryLoading } = useWholesaleInventory();
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate total available pallets
  const totalPalletsAvailable = wholesaleInventory.reduce((sum, item) => sum + item.pallets_available, 0);

  // Group inventory by wood species
  const palletsGroupedBySpecies = wholesaleInventory.reduce((grouped, item) => {
    const product = woodProducts.find(p => p.id === item.wood_product_id);
    if (product) {
      const species = product.species;
      if (!grouped[species]) {
        grouped[species] = 0;
      }
      grouped[species] += item.pallets_available;
    }
    return grouped;
  }, {} as Record<string, number>);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Available Raw Material Pallets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <>
            <div 
              className="text-2xl font-bold text-blue-600 flex items-center cursor-pointer" 
              onClick={() => setShowDetails(!showDetails)}
            >
              <Package2 className="h-5 w-5 mr-2" />
              {totalPalletsAvailable.toLocaleString()} pallets
              <span className="text-xs ml-2 text-gray-500">(click for details)</span>
            </div>
            
            {showDetails && (
              <div className="mt-4 space-y-2 text-sm">
                <h4 className="font-semibold">Pallets by Wood Type:</h4>
                <div className="grid grid-cols-1 gap-y-1">
                  {Object.entries(palletsGroupedBySpecies)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([species, count]) => (
                      <div key={species} className="flex justify-between items-center">
                        <span>{species}</span>
                        <span className="font-semibold">{count} pallets</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
