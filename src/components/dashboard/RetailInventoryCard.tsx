
import { useRetailInventory } from "@/pages/wholesale-order/hooks/useRetailInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

export function RetailInventoryCard() {
  const { retailInventory, loading: inventoryLoading } = useRetailInventory();
  
  // Calculate total retail packages
  const totalRetailPackages = retailInventory.reduce((sum, item) => sum + item.packages_available, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Available Retail Packages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold text-green-600 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {totalRetailPackages.toLocaleString()} packages
          </div>
        )}
      </CardContent>
    </Card>
  );
}
