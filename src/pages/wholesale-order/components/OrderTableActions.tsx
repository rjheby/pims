
import { Button } from "@/components/ui/button";
import { Copy, Plus, X, Minimize2, Maximize2 } from "lucide-react";
import { OrderItem } from "../types";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useState } from "react";

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
  const { items, setItems } = useWholesaleOrder();
  const [isCompressed, setIsCompressed] = useState(false);
  
  const handleAddItem = () => {
    const maxId = Math.max(...items.map(item => item.id), 0);
    setItems([
      ...items,
      {
        id: maxId + 1,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        packaging: "Pallets",
        pallets: 0,
        quantity: 0,
      },
    ]);
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
        onClick={handleAddItem}
        className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white rounded-full w-8 h-8 p-0"
        aria-label="Add Item"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCompressed(!isCompressed)}
        className="bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full w-8 h-8 p-0"
        data-compressed={isCompressed}
        aria-label={isCompressed ? "Expand" : "Compress"}
      >
        {isCompressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
