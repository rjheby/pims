import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecurrenceData } from "./RecurringOrderForm";
import { Plus, Minus, X, ShoppingCart } from "lucide-react";
import { FirewoodProduct } from "./types";

interface ItemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: string, itemsData?: any[], recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems?: string | null;
  recurrenceData?: RecurrenceData;
}

interface ItemData {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
  onCancel,
  initialItems,
  recurrenceData
}) => {
  const [itemsText, setItemsText] = useState(initialItems || '');
  const [itemsData, setItemsData] = useState<ItemData[]>([
    { id: 1, name: 'Split Firewood', quantity: 30, price: 7.50 }
  ]);
  const [newItem, setNewItem] = useState<ItemData>({ id: 0, name: '', quantity: 1, price: 0 });
  
  const sampleProducts: FirewoodProduct[] = [
    { id: 1, item_name: 'split_firewood', item_full_name: 'Split Firewood', species: 'Oak', length: '16"', split_size: 'Medium' },
    { id: 2, item_name: 'kindling', item_full_name: 'Kindling', product_type: 'Starter' },
    { id: 3, item_name: 'premium_bundle', item_full_name: 'Premium Bundle', species: 'Maple', package_size: 'Large' },
    { id: 4, item_name: 'fire_starter', item_full_name: 'Fire Starter Logs', product_type: 'Starter' },
  ];
  
  useEffect(() => {
    if (open) {
      if (initialItems) {
        setItemsText(initialItems);
      }
    }
  }, [open, initialItems]);
  
  const handleSave = () => {
    const formattedItemsText = itemsData
      .map(item => `${item.quantity}x ${item.name} @$${item.price.toFixed(2)}`)
      .join(', ');
    
    setItemsText(formattedItemsText);
    onSelect(formattedItemsText, itemsData, recurrenceData);
  };
  
  const handleCancel = () => {
    onCancel();
  };
  
  const addItemToList = () => {
    if (newItem.name && newItem.quantity > 0 && newItem.price > 0) {
      const nextId = Math.max(0, ...itemsData.map(item => item.id)) + 1;
      setItemsData([...itemsData, { ...newItem, id: nextId }]);
      setNewItem({ id: 0, name: '', quantity: 1, price: 0 });
    }
  };
  
  const removeItem = (id: number) => {
    setItemsData(itemsData.filter(item => item.id !== id));
  };
  
  const updateItemQuantity = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      setItemsData(
        itemsData.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const selectProduct = (product: FirewoodProduct) => {
    setNewItem({
      ...newItem,
      name: product.item_full_name,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[75vw] lg:max-w-[65vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add Items
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
          <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-md overflow-y-auto">
            <h3 className="font-medium mb-3">Select Products</h3>
            <div className="space-y-3">
              {sampleProducts.map(product => (
                <div 
                  key={product.id}
                  className="p-3 bg-white rounded-md border border-gray-200 hover:border-primary cursor-pointer transition-all"
                  onClick={() => selectProduct(product)}
                >
                  <div className="font-medium">{product.item_full_name}</div>
                  <div className="text-sm text-gray-500">
                    {product.species && `${product.species} • `}
                    {product.length && `${product.length} • `}
                    {product.split_size && `${product.split_size} Split`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-3">Add New Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Product name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="item-quantity">Quantity</Label>
                  <Input
                    id="item-quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="item-price">Price ($)</Label>
                  <Input
                    id="item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
              <Button 
                onClick={addItemToList} 
                className="mt-3 w-full"
                disabled={!newItem.name || newItem.quantity <= 0 || newItem.price <= 0}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto border rounded-md p-4">
              <h3 className="font-medium mb-3">Current Items</h3>
              {itemsData.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No items added yet. Add some items above.
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsData.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          ${item.price.toFixed(2)} each • Total: ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Items:</span>
                <span>{itemsData.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg mt-1">
                <span>Total Price:</span>
                <span>
                  ${itemsData
                    .reduce((sum, item) => sum + item.quantity * item.price, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="items" className="text-sm font-medium">
            Items (comma separated)
          </Label>
          <textarea
            id="items"
            className="w-full min-h-[80px] p-2 border rounded text-sm"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            placeholder="e.g., 30x Split Firewood @$7.50, 10x Kindling @$5.00"
          />
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
