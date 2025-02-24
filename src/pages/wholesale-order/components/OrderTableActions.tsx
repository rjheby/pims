
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
  onUpdateItem
}: OrderTableActionsProps) {
  const {
    items,
    setItems
  } = useWholesaleOrder();
  const [isCompressed, setIsCompressed] = useState(false);

  const handleAddItem = () => {
    const maxId = Math.max(...items.map(item => item.id), 0);
    setItems([...items, {
      id: maxId + 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      quantity: 0
    }]);
  };

  return <div className="flex gap-2 items-center">
      <Button variant="ghost" size="sm" onClick={() => onRemoveRow(item.id)} className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800 transition-all duration-200">
        <X className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onCopyRow(item)} className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700 transition-all duration-200">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleAddItem} aria-label="Add Item" className="bg-[#2A4131] hover:bg-slate-50 rounded-full w-8 h-8 p-0 text-slate-50 hover:text-[#2A4131] transition-all duration-200">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setIsCompressed(!isCompressed)} data-compressed={isCompressed} aria-label={isCompressed ? "Expand" : "Compress"} className="rounded-full w-8 h-8 p-0 bg-indigo-500 hover:bg-slate-50 text-slate-50 hover:text-indigo-500 transition-all duration-200">
        {isCompressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
      </Button>
    </div>;
}
