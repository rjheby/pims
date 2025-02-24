
import { Button } from "@/components/ui/button";
import { OrderItem } from "../types";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";

export function OrderTableActions() {
  const { items, setItems } = useWholesaleOrder();
  const { toast } = useToast();

  const handleAddItem = () => {
    const maxId = Math.max(...items.map(item => item.id), 0);
    const newItem: OrderItem = {
      id: maxId + 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      unitCost: 250
    };

    setItems([...items, newItem]);

    toast({
      title: "Item Added",
      description: "A new item has been added to the order.",
    });
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been removed from the order.",
    });
  };

  return (
    <div className="flex justify-between items-center py-4">
      <Button onClick={handleAddItem} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
        Add Item
      </Button>
    </div>
  );
}
