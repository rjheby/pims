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
      <Button variant="ghost" size="sm" onClick={() => onRemoveRow(item.id)} className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-red-700">
        <X className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onCopyRow(item)} className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-blue-600">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleAddItem} className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white rounded-full w-8 h-8 p-0" aria-label="Add Item">
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setIsCompressed(!isCompressed)} data-compressed={isCompressed} aria-label={isCompressed ? "Expand" : "Compress"} className="rounded-full w-8 h-8 p-0 bg-indigo-500 hover:bg-indigo-400 text-slate-50">
        {isCompressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
      </Button>
    </div>;
}