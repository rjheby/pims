
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Truck } from "lucide-react";
import { InventoryItem, WoodProduct } from "@/pages/wholesale-order/types";

interface RawMaterialsTableProps {
  data: (InventoryItem & { product?: WoodProduct })[];
  loading: boolean;
  isAdmin: boolean;
  onRefresh: () => void;
}

export function RawMaterialsTable({
  data,
  loading,
  isAdmin,
  onRefresh
}: RawMaterialsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Thickness</TableHead>
              <TableHead className="text-center">Available Pallets</TableHead>
              <TableHead className="text-center">Allocated</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No raw materials data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.product?.full_description || 'Unknown Product'}
                  </TableCell>
                  <TableCell>{item.product?.species || '-'}</TableCell>
                  <TableCell>{item.product?.length || '-'}</TableCell>
                  <TableCell>{item.product?.thickness || '-'}</TableCell>
                  <TableCell className="text-center">
                    <span className={item.pallets_available === 0 ? "text-red-500" : "text-green-600"}>
                      {item.pallets_available}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{item.pallets_allocated}</TableCell>
                  <TableCell className="text-center">{item.total_pallets}</TableCell>
                  <TableCell className="text-center">
                    {new Date(item.last_updated).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
