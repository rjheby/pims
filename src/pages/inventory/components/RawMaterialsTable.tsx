
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
              <TableHead className="text-center">Product</TableHead>
              <TableHead className="text-center">Available Pallets</TableHead>
              <TableHead className="text-center">Allocated</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No raw materials data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <>
                  <TableRow key={item.id}>
                    <TableCell>
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleItem(item.id)}
                      >
                        {expandedItems[item.id] ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="font-medium whitespace-normal break-words">
                          {item.product?.full_description || 'Unknown Product'}
                        </span>
                      </div>
                    </TableCell>
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
                  {expandedItems[item.id] && (
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={5} className="py-2">
                        <div className="grid grid-cols-3 gap-4 px-8">
                          <div>
                            <span className="text-sm font-medium">Species:</span>
                            <span className="text-sm ml-2">{item.product?.species || '-'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Length:</span>
                            <span className="text-sm ml-2">{item.product?.length || '-'}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Thickness:</span>
                            <span className="text-sm ml-2">{item.product?.thickness || '-'}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
