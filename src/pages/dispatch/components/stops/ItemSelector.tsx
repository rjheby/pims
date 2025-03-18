
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RecurrenceData } from "./RecurringOrderForm";
import { useRetailInventory } from "../../hooks/useRetailInventory";
import { Loader2 } from "lucide-react";

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
  const [selectedItemsWithDetails, setSelectedItemsWithDetails] = useState<any[]>([]);
  
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
      
      // Also set details for display
      const itemsWithDetails = matchedIds.map(id => {
        const item = inventoryWithProducts.find(inv => inv.id?.toString() === id);
        return item;
      }).filter(Boolean);
      
      setSelectedItemsWithDetails(itemsWithDetails);
    }
  }, [initialItems, inventoryWithProducts]);
  
  const handleAddItem = (itemId: string) => {
    if (!itemId || itemId === '') return;
    
    if (!selectedItemIds.includes(itemId)) {
      setSelectedItemIds([...selectedItemIds, itemId]);
      
      // Find the selected item with details
      const selectedItem = inventoryWithProducts.find(item => item.id?.toString() === itemId);
      
      if (selectedItem && selectedItem.product) {
        // Add to selected items with details
        setSelectedItemsWithDetails([...selectedItemsWithDetails, selectedItem]);
        
        // Update items string
        const itemName = selectedItem.product.name || selectedItem.product.description || 'Unknown Item';
        const newItems = items ? `${items}, ${itemName}` : itemName;
        setItems(newItems);
      }
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    setSelectedItemsWithDetails(selectedItemsWithDetails.filter(item => item.id?.toString() !== itemId));
    
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
  
  // Function to format price for display
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'Price N/A';
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Inventory Items</DialogTitle>
          <DialogDescription>
            Choose items from your retail inventory to add to this delivery stop.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Add Items</Label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading inventory...</span>
              </div>
            ) : (
              <Select onValueChange={handleAddItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item to add" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryWithProducts.map((item) => {
                    if (!item.id || !item.product) return null;
                    
                    // Use a default value if id is empty
                    const itemId = item.id.toString() || "placeholder-id";
                    const itemName = item.product.name || item.product.description || "Unknown Item";
                    const available = item.packages_available || 0;
                    const price = item.product.price;
                    
                    return (
                      <SelectItem key={itemId} value={itemId} disabled={available <= 0}>
                        <div className="flex justify-between w-full">
                          <span>{itemName}</span>
                          <span className="text-gray-500 ml-2">
                            {formatPrice(price)} • {available} available
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Selected Items</Label>
            {selectedItemsWithDetails.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedItemsWithDetails.map((item) => {
                  const itemId = item.id?.toString() || "";
                  const itemName = item.product?.name || item.product?.description || "Unknown Item";
                  const available = item.packages_available || 0;
                  const price = item.product?.price;
                  
                  return (
                    <div key={itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex flex-col">
                        <span className="font-medium">{itemName}</span>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{formatPrice(price)}</Badge>
                          <Badge variant="secondary">{available} available</Badge>
                        </div>
                      </div>
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
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded text-center">
                No items selected
              </div>
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
