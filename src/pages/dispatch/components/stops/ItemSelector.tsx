
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RecurrenceData } from "./RecurringOrderForm";
import { useRetailInventory } from "../../hooks/useRetailInventory"; // Import the hook

interface ItemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: string, recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems: string | null;
  recurrenceData: RecurrenceData;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
  onCancel,
  initialItems,
  recurrenceData
}) => {
  const [items, setItems] = useState<string>(initialItems || '');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Use the retail inventory hook
  const { 
    retailInventory, 
    firewoodProducts, 
    loading,
    getInventoryWithProductDetails 
  } = useRetailInventory();
  
  // Get inventory with product details
  const inventoryWithProducts = getInventoryWithProductDetails();
  
  // Initialize selected items from initialItems string
  useEffect(() => {
    if (initialItems && inventoryWithProducts.length > 0) {
      const itemsList = initialItems.split(',').map(item => item.trim());
      
      // Try to match by product name
      const matchedIds = inventoryWithProducts
        .filter(invItem => 
          itemsList.includes(invItem.product?.name || '') || 
          itemsList.includes(invItem.product?.description || '')
        )
        .map(item => item.id?.toString() || "");
      
      setSelectedItemIds(matchedIds);
    }
  }, [initialItems, inventoryWithProducts]);
  
  const handleAddItem = (itemId: string) => {
    if (!itemId || itemId === '') return;
    
    if (!selectedItemIds.includes(itemId)) {
      setSelectedItemIds([...selectedItemIds, itemId]);
      
      // Update items string
      const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
      if (selectedItem && selectedItem.product) {
        const itemName = selectedItem.product.name || selectedItem.product.description || 'Unknown Item';
        const newItems = items ? `${items}, ${itemName}` : itemName;
        setItems(newItems);
      }
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    
    // Update items string
    const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
    if (selectedItem && selectedItem.product) {
      const itemName = selectedItem.product.name || selectedItem.product.description || '';
      const itemsList = items.split(',').map(item => item.trim());
      const filteredItems = itemsList.filter(item => item !== itemName);
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
            {loading ? (
              <div className="text-sm text-gray-500">Loading inventory...</div>
            ) : (
              <Select onValueChange={handleAddItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item to add" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryWithProducts.map((item) => {
                    if (!item.id || !item.product) return null;
                    
                    // Use a default value if id is empty
                    const itemId = item.id.toString() || "placeholder-value";
                    const itemName = item.product.name || item.product.description || "Unknown Item";
                    const available = item.packages_available || 0;
                    
                    return (
                      <SelectItem key={itemId} value={itemId}>
                        {itemName} ({available} available)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Selected Items</Label>
            {selectedItemIds.length > 0 ? (
              <div className="space-y-2">
                {selectedItemIds.map((itemId) => {
                  const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
                  const itemName = selectedItem?.product?.name || selectedItem?.product?.description || "Unknown Item";
                  
                  return (
                    <div key={itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{itemName}</span>
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
              placeholder="e.g. Oak Firewood, Kindling, Cedar"
            />
            <p className="text-xs text-gray-500">
              These items will be added to the delivery stop.
            </p>
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
