
import { useState, useEffect } from "react";
import { useWholesaleInventory } from "@/pages/wholesale-order/hooks/useWholesaleInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function PalletsAvailableCard() {
  const { wholesaleInventory, woodProducts, loading: inventoryLoading, fetchWholesaleInventory } = useWholesaleInventory();
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();
  
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

  // Function to handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWholesaleInventory();
    setIsRefreshing(false);
  };

  // Auto-refresh when component mounts
  useEffect(() => {
    fetchWholesaleInventory();
  }, [fetchWholesaleInventory]);

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Available Raw Material Pallets
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing || inventoryLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        {inventoryLoading || isRefreshing ? (
          <Skeleton className="h-8 w-full max-w-[100px]" />
        ) : totalPalletsAvailable === 0 ? (
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-gray-400 flex items-center justify-center">
              <Package2 className="h-5 w-5 mr-2" />
              No pallets available
            </div>
            <p className="text-xs text-gray-500 mt-1">Submit a supplier order to add inventory</p>
          </div>
        ) : (
          <>
            <div 
              className="text-2xl font-bold text-blue-600 flex items-center cursor-pointer" 
              onClick={() => setShowDetails(!showDetails)}
            >
              <Package2 className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="flex flex-wrap items-center">
                <span>{totalPalletsAvailable.toLocaleString()} pallets</span>
                <span className="text-xs ml-2 text-gray-500">(click for details)</span>
              </div>
            </div>
            
            {showDetails && (
              <div className="mt-4 space-y-2 text-sm">
                <h4 className="font-semibold">Pallets by Wood Type:</h4>
                {Object.entries(palletsGroupedBySpecies).length > 0 ? (
                  <div className="grid grid-cols-1 gap-y-1 max-h-[200px] overflow-y-auto pr-1">
                    {Object.entries(palletsGroupedBySpecies)
                      .sort(([, countA], [, countB]) => countB - countA)
                      .map(([species, count]) => (
                        <div key={species} className="flex justify-between items-center">
                          <span className="truncate mr-2">{species}</span>
                          <span className="font-semibold whitespace-nowrap">{count} pallets</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No inventory details available</div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
