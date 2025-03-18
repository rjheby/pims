
import React, { useState, useEffect, useMemo } from "react";
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
import { useRetailInventory, InventoryItem } from "../../hooks/useRetailInventory";
import { Loader2, Search, Plus, Minus, DollarSign } from "lucide-react";

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
  const [selectedItemsWithDetails, setSelectedItemsWithDetails] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Use the retail inventory hook
  const { 
    loading,
    getInventoryWithProductDetails 
  } = useRetailInventory();
  
  // Get inventory with product details
  const inventoryWithProducts = getInventoryWithProductDetails();
  
  // Filter inventory items based on search term
  const filteredInventory = useMemo(() => {
    if (!searchTerm) return inventoryWithProducts;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return inventoryWithProducts.filter((item) => {
      const productName = item.product?.name?.toLowerCase() || '';
      const productDesc = item.product?.description?.toLowerCase() || '';
      return productName.includes(lowercaseSearch) || productDesc.includes(lowercaseSearch);
    });
  }, [inventoryWithProducts, searchTerm]);
  
  // Initialize selected items from initialItems string
  useEffect(() => {
    if (initialItems && inventoryWithProducts.length > 0) {
      const itemsList = initialItems.split(',').map(item => item.trim());
      
      // Try to match by product name
      const matchedItems = inventoryWithProducts
        .filter(invItem => 
          itemsList.includes(invItem.product?.name || '') || 
          itemsList.includes(invItem.product?.description || '')
        );
      
      if (matchedItems.length > 0) {
        const matchedIds = matchedItems.map(item => item.id);
        setSelectedItemIds(matchedIds);
        setSelectedItemsWithDetails(matchedItems);
      }
    }
  }, [initialItems, inventoryWithProducts]);
  
  // Calculate total price whenever selected items change
  useEffect(() => {
    const newTotal = selectedItemsWithDetails.reduce((sum, item) => {
      const itemPrice = item.custom_price || item.product?.price || 0;
      const quantity = item.quantity || 1;
      return sum + (itemPrice * quantity);
    }, 0);
    
    setTotalPrice(newTotal);
  }, [selectedItemsWithDetails]);
  
  const handleAddItem = (itemId: string) => {
    if (!itemId || itemId === '') return;
    
    if (!selectedItemIds.includes(itemId)) {
      setSelectedItemIds([...selectedItemIds, itemId]);
      
      // Find the selected item with details
      const selectedItem = inventoryWithProducts.find(item => item.id === itemId);
      
      if (selectedItem && selectedItem.product) {
        // Add to selected items with details
        const newItem = {
          ...selectedItem,
          quantity: 1, // Initialize with quantity of 1
          custom_price: selectedItem.product.price // Initialize with default price
        };
        
        setSelectedItemsWithDetails([...selectedItemsWithDetails, newItem]);
        
        // Update items string
        updateItemsString([...selectedItemsWithDetails, newItem]);
      }
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setSelectedItemIds(selectedItemIds.filter(id => id !== itemId));
    const updatedItems = selectedItemsWithDetails.filter(item => item.id !== itemId);
    setSelectedItemsWithDetails(updatedItems);
    
    // Update items string
    updateItemsString(updatedItems);
  };
  
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Ensure quantity is at least 1
    const quantity = Math.max(1, newQuantity);
    
    const updatedItems = selectedItemsWithDetails.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    setSelectedItemsWithDetails(updatedItems);
    updateItemsString(updatedItems);
  };
  
  const handlePriceChange = (itemId: string, newPrice: number) => {
    const updatedItems = selectedItemsWithDetails.map(item => 
      item.id === itemId ? { ...item, custom_price: newPrice } : item
    );
    
    setSelectedItemsWithDetails(updatedItems);
    updateItemsString(updatedItems);
  };
  
  const updateItemsString = (itemsList: InventoryItem[]) => {
    // Create a detailed items string with quantity and custom price if applicable
    const itemsArray = itemsList.map(item => {
      const name = item.product?.name || item.product?.description || 'Unknown Item';
      const quantity = item.quantity || 1;
      const price = item.custom_price || item.product?.price;
      
      if (quantity > 1) {
        return `${quantity}x ${name}${price !== item.product?.price ? ` @$${price?.toFixed(2)}` : ''}`;
      }
      
      return `${name}${price !== item.product?.price ? ` @$${price?.toFixed(2)}` : ''}`;
    });
    
    setItems(itemsArray.join(', '));
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
            <Label>Search Inventory</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
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
                  {filteredInventory.map((item) => {
                    if (!item.id || !item.product) return null;
                    
                    const itemId = item.id.toString();
                    const itemName = item.product.name || item.product.description || "Unknown Item";
                    const available = item.packages_available || 0;
                    const price = item.product.price;
                    
                    return (
                      <SelectItem key={itemId} value={itemId} disabled={available <= 0 || selectedItemIds.includes(itemId)}>
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
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {selectedItemsWithDetails.map((item) => {
                  const itemId = item.id;
                  const itemName = item.product?.name || item.product?.description || "Unknown Item";
                  const available = item.packages_available || 0;
                  const quantity = item.quantity || 1;
                  const originalPrice = item.product?.price || 0;
                  const customPrice = item.custom_price !== undefined ? item.custom_price : originalPrice;
                  
                  return (
                    <div key={itemId} className="flex flex-col p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{itemName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveItem(itemId)}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{available} available</Badge>
                        <Badge variant="secondary">Item Price: {formatPrice(customPrice)}</Badge>
                        <Badge variant="secondary">Total: {formatPrice(customPrice * quantity)}</Badge>
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <div className="flex items-center">
                          <Label className="mr-2 text-sm">Quantity:</Label>
                          <div className="flex items-center border rounded">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2 rounded-r-none"
                              onClick={() => handleQuantityChange(itemId, quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="h-8 px-2 rounded-l-none"
                              onClick={() => handleQuantityChange(itemId, quantity + 1)}
                              disabled={quantity >= available}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Label className="mr-2 text-sm">Price:</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type="number"
                              value={customPrice}
                              onChange={(e) => handlePriceChange(itemId, parseFloat(e.target.value) || 0)}
                              className="w-24 pl-7"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
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
            <Label htmlFor="items">Items Summary</Label>
            <Input
              id="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Items will be displayed here"
            />
            <p className="text-xs text-gray-500">
              You can also edit this text directly for custom descriptions.
            </p>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
            </div>
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
