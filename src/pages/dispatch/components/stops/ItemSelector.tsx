
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RecurrenceData, RecurringOrderForm } from "./RecurringOrderForm";

interface ItemSelectorProps {
  onSelect: (items: string, recurrenceInfo?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems?: string | null;
  initialRecurrence?: RecurrenceData;
}

export const ItemSelector = ({
  onSelect,
  onCancel,
  initialItems,
  initialRecurrence = { isRecurring: false, frequency: 'none' }
}: ItemSelectorProps) => {
  const [items, setItems] = useState<string>(initialItems || '');
  const [itemType, setItemType] = useState<string>('cord');
  const [quantity, setQuantity] = useState<string>('1');
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>(initialRecurrence);
  
  const woodTypes = [
    { id: 'oak', name: 'Oak' },
    { id: 'maple', name: 'Maple' },
    { id: 'pine', name: 'Pine' },
    { id: 'birch', name: 'Birch' },
    { id: 'mixed', name: 'Mixed Hardwood' }
  ];
  
  const packageTypes = [
    { id: 'cord', name: 'Full Cord' },
    { id: 'half-cord', name: 'Half Cord' },
    { id: 'quarter-cord', name: 'Quarter Cord' },
    { id: 'bundle', name: 'Bundle' },
    { id: 'kindling', name: 'Kindling Box' }
  ];

  const handleAddItem = () => {
    const selectedWoodType = document.getElementById('wood-type') as HTMLSelectElement;
    const woodTypeValue = selectedWoodType.value;
    
    if (!woodTypeValue || !itemType || !quantity) return;
    
    const woodTypeName = woodTypes.find(w => w.id === woodTypeValue)?.name;
    const packageTypeName = packageTypes.find(p => p.id === itemType)?.name;
    
    if (!woodTypeName || !packageTypeName) return;
    
    const newItem = `${quantity} ${packageTypeName} - ${woodTypeName}`;
    
    setItems(prev => {
      if (prev && prev.trim() !== '') {
        return `${prev}, ${newItem}`;
      }
      return newItem;
    });
  };

  const handleConfirm = () => {
    if (!items || items.trim() === '') return;
    
    onSelect(items, recurrenceData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current-items">Current Items</Label>
          <Input
            id="current-items"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="No items added yet"
          />
        </div>
        
        <div className="border-t my-4"></div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Add an Item</h4>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="item-type">Package</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger id="item-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="wood-type">Wood Type</Label>
              <Select defaultValue={woodTypes[0].id}>
                <SelectTrigger id="wood-type">
                  <SelectValue placeholder="Select wood" />
                </SelectTrigger>
                <SelectContent>
                  {woodTypes.map((wood) => (
                    <SelectItem key={wood.id} value={wood.id}>
                      {wood.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
            Add Item to List
          </Button>
        </div>
        
        <div className="border-t my-4"></div>
        
        <RecurringOrderForm
          recurrenceData={recurrenceData}
          onRecurrenceChange={setRecurrenceData}
          initialRecurrence={initialRecurrence}
        />
      </div>
      
      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!items || items.trim() === ''}>
          Confirm Selection
        </Button>
      </div>
    </div>
  );
};
