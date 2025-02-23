
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
  const handleAddPallet = () => {
    const newPalletCount = (item.pallets || 0) + 1;
    
    // Calculate total pallets across all items
    const items = document.querySelectorAll('[data-pallet-count]');
    const totalPallets = Array.from(items).reduce((sum, el) => {
      return sum + (parseInt(el.getAttribute('data-pallet-count') || '0', 10));
    }, 0) + 1; // Add 1 for the new pallet we're adding

    if (totalPallets > 24) {
      toast({
        title: "Warning",
        description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
        variant: "destructive",
      });
      return;
    }

    onUpdateItem(item.id, "pallets", newPalletCount);
  };

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
        onClick={handleAddPallet}
        className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white rounded-full w-8 h-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
