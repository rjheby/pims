
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
import { useRetailInventory } from "../../hooks/useRetailInventory"; // Import the retail inventory hook

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
  console.log("ItemsSelector rendering with props:", { 
    open, 
    initialItems
  });
  
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
  
  // Log inventory data for debugging
  useEffect(() => {
    console.log("Retail inventory loaded:", { 
      retailInventoryCount: retailInventory.length,
      firewoodProductsCount: firewoodProducts.length,
      inventoryWithProductsCount: inventoryWithProducts.length
    });
  }, [retailInventory, firewoodProducts, inventoryWithProducts]);
  
  // Initialize selected items from initialItems string
  useEffect(() => {
    if (initialItems && inventoryWithProducts.length > 0) {
      console.log("Initializing selected items from:", initialItems);
      const itemsList = initialItems.split(',').map(item => item.trim());
      
      // Try to match by product name
      const matchedIds = inventoryWithProducts
        .filter(invItem => 
          itemsList.includes(invItem.product?.name || '') || 
          itemsList.includes(invItem.product?.description || '')
        )
        .map(item => item.id?.toString() || "");
      
      console.log("Matched item IDs:", matchedIds);
      setSelectedItemIds(matchedIds);
    }
  }, [initialItems, inventoryWithProducts]);
  
  const handleAddItem = (itemId: string) => {
    console.log("Adding item with ID:", itemId);
    if (!itemId || itemId === '') {
      console.warn("Attempted to add item with empty ID");
      return;
    }
    
    if (!selectedItemIds.includes(itemId)) {
      const newSelectedIds = [...selectedItemIds, itemId];
      setSelectedItemIds(newSelectedIds);
      console.log("Updated selected item IDs:", newSelectedIds);
      
      // Update items string
      const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
      if (selectedItem && selectedItem.product) {
        const itemName = selectedItem.product.name || selectedItem.product.description || 'Unknown Item';
        const newItems = items ? `${items}, ${itemName}` : itemName;
        console.log("Updated items string:", newItems);
        setItems(newItems);
      } else {
        console.warn("Selected item or product not found in inventory:", itemId);
      }
    } else {
      console.log("Item already selected, not adding again:", itemId);
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    console.log("Removing item with ID:", itemId);
    const newSelectedIds = selectedItemIds.filter(id => id !== itemId);
    setSelectedItemIds(newSelectedIds);
    console.log("Updated selected item IDs after removal:", newSelectedIds);
    
    // Update items string
    const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
    if (selectedItem && selectedItem.product) {
      const itemName = selectedItem.product.name || selectedItem.product.description || '';
      const itemsList = items.split(',').map(item => item.trim());
      const filteredItems = itemsList.filter(item => item !== itemName);
      const newItemsString = filteredItems.join(', ');
      console.log("Updated items string after removal:", newItemsString);
      setItems(newItemsString);
    } else {
      console.warn("Item to remove not found in inventory:", itemId);
    }
  };
  
  const handleSave = () => {
    console.log("Saving items:", items);
    onSelect(items, recurrenceData);
  };
  
  const handleCancel = () => {
    console.log("Cancelling item selection");
    onCancel();
  };
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log("ItemsSelector dialog openChange:", newOpen);
        onOpenChange(newOpen);
      }}
    >
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
                    if (!item.id || !item.product) {
                      console.warn("Skipping item without ID or product:", item);
                      return null;
                    }
                    
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
              onChange={(e) => {
                console.log("Items input changed:", e.target.value);
                setItems(e.target.value);
              }}
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
