
import { useWholesaleInventory } from "@/pages/wholesale-order/hooks/useWholesaleInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package2 } from "lucide-react";

export function PalletsAvailableCard() {
  const { wholesaleInventory, loading: inventoryLoading } = useWholesaleInventory();
  
  // Calculate total available pallets
  const totalPalletsAvailable = wholesaleInventory.reduce((sum, item) => sum + item.pallets_available, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Available Raw Material Pallets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryLoading ? (
          <Skeleton className="h-8 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold text-blue-600 flex items-center">
            <Package2 className="h-5 w-5 mr-2" />
            {totalPalletsAvailable.toLocaleString()} pallets
          </div>
        )}
      </CardContent>
    </Card>
  );
}
