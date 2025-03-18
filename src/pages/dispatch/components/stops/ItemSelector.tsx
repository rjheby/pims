import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RecurrenceData } from "./RecurringOrderForm"; // Make sure this import exists

interface RetailInventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  // Add other fields as needed
}

interface ItemsSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: string, recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems: string | null;
  recurrenceData: RecurrenceData;
}

export const ItemsSelector: React.FC<ItemsSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
  onCancel,
  initialItems,
  recurrenceData
}) => {
  const [items, setItems] = useState<string>(initialItems || '');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [inventoryItems, setInventoryItems] = useState<RetailInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch inventory items when component mounts
  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('retailinventory')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching inventory:', error);
          return;
        }
        
        setInventoryItems(data || []);
      } catch (err) {
        console.error('Error in fetch operation:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInventory();
  }, []);
  
  // Initialize selected items from initialItems string
  useEffect(() => {
    if (initialItems) {
      const itemsList = initialItems.split(',').map(item => item.trim());
      setSelectedItemIds(
        inventoryItems
          .filter(invItem => itemsList.includes(invItem.name))
          .map(item => item.id)
      );
    }
  }, [initialItems, inventoryItems]);
  
  const handleAddItem = (itemId: string) => {
    if (!itemId || itemId === '') return;
    
    if (!selectedItemIds.includes(itemId)) {
      setSelectedItemIds([...selectedItemIds, itemId]);
      
      // Update items string
      const selectedItem = inventoryItems.find(item => item.id === itemId);
      if (selectedItem) {
        const newItems = items ? `${items},${selectedItem.name}` : selectedItem.name;
        setItems(newItems);
      }
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    
    // Update items string
    const selectedItem = inventoryItems.find(item => item.id === itemId);
    if (selectedItem) {
      const itemsList = items.split(',').map(item => item.trim());
      const filteredItems = itemsList.filter(item => item !== selectedItem.name);
      setItems(filteredItems.join(', '));
    }
  };
  
  const handleSave = () => {
    onSelect(items, recurrenceData);
  };
  
  const handleCancel = () => {
    onCancel();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Inventory Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Add Items</Label>
            <Select onValueChange={handleAddItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select an item to add" />
              </SelectTrigger>
              <SelectContent>
                {inventoryItems.map((item) => (
                  // Using a non-empty string for value
                  <SelectItem key={item.id} value={item.id || "placeholder-value"}>
                    {item.name} {item.sku ? `(${item.sku})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Selected Items</Label>
            {selectedItemIds.length > 0 ? (
              <div className="space-y-2">
                {selectedItemIds.map((itemId) => {
                  const item = inventoryItems.find(i => i.id === itemId);
                  return (
                    <div key={itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{item?.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveItem(itemId)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-2">No items selected</div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="items">Items (comma separated)</Label>
            <Input
              id="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="e.g. Item1, Item2, Item3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
