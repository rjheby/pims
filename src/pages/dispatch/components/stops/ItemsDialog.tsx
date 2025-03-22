
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ItemsDialogProps {
  onItemsSelect: (items: string) => void;
  onCancel: () => void;
  initialItems?: string;
}

interface ItemOption {
  id: string;
  name: string;
  selected: boolean;
  quantity: number;
}

export const ItemsDialog: React.FC<ItemsDialogProps> = ({
  onItemsSelect,
  onCancel,
  initialItems = ""
}) => {
  // Parse initial items or start with defaults
  const initialItemsArray = initialItems ? initialItems.split(",") : [];
  
  // Sample items - in a real app, these would come from an API or props
  const [items, setItems] = useState<ItemOption[]>([
    { id: "oak", name: "Oak Bundle", selected: initialItemsArray.includes("Oak Bundle"), quantity: 1 },
    { id: "maple", name: "Maple Bundle", selected: initialItemsArray.includes("Maple Bundle"), quantity: 1 },
    { id: "mixed", name: "Mixed Hardwood Bundle", selected: initialItemsArray.includes("Mixed Hardwood Bundle"), quantity: 1 },
    { id: "birch", name: "Birch Bundle", selected: initialItemsArray.includes("Birch Bundle"), quantity: 1 },
    { id: "cherry", name: "Cherry Bundle", selected: initialItemsArray.includes("Cherry Bundle"), quantity: 1 },
    { id: "box", name: "Firewood Box", selected: initialItemsArray.includes("Firewood Box"), quantity: 1 },
  ]);

  const handleToggleItem = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleSave = () => {
    const selectedItems = items
      .filter(item => item.selected)
      .map(item => `${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`)
      .join(", ");
      
    onItemsSelect(selectedItems);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-y-auto max-h-[400px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center">
              <Checkbox
                id={`item-${item.id}`}
                checked={item.selected}
                onCheckedChange={() => handleToggleItem(item.id)}
              />
              <Label htmlFor={`item-${item.id}`} className="ml-2 cursor-pointer">
                {item.name}
              </Label>
            </div>
            
            {item.selected && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                  className="h-8 w-16 mx-2 text-center"
                  min="1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Items
        </Button>
      </div>
    </div>
  );
};
