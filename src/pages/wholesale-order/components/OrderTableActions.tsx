
import { Button } from "@/components/ui/button";
import { Copy, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { OrderItem } from "../types";

interface OrderTableActionsProps {
  item: OrderItem;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
}

export function OrderTableActions({
  item,
  onRemoveRow,
  onCopyRow,
  onUpdateItem,
}: OrderTableActionsProps) {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemoveRow(item.id)}
        className="bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full w-8 h-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCopyRow(item)}
        className="bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 rounded-full w-8 h-8 p-0"
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const totalPallets = 0;
          const newPallets = 0;

          if (totalPallets + newPallets > 24) {
            toast({
              title: "Warning",
              description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
              variant: "destructive",
            });
            return;
          }

          onUpdateItem(item.id, "pallets", newPallets);
        }}
        className="text-xs text-[#2A4131] hover:bg-[#F2E9D2]/50 rounded-full w-8 h-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
