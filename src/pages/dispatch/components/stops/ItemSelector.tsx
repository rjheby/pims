import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecurrenceData } from "./RecurringOrderForm";
import { useRetailInventory } from "@/pages/dispatch/hooks/useRetailInventory";
import { Plus, Minus } from "lucide-react";

interface ItemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: string, itemsData?: any[], recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems?: string | null;
  recurrenceData?: RecurrenceData;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({
  open,
  onOpenChange,
  onSelect,
  onCancel,
  initialItems,
  recurrenceData
}) => {
  const { loading, getInventoryWithProductDetails } = useRetailInventory();
  const [selectedItems, setSelectedItems] = useState<{id: string; name: string; quantity: number; price?: number}[]>([]);
  
  useEffect(() => {
    if (open && initialItems) {
      try {
        const itemsArray = initialItems.split(',').map(item => item.trim());
        const parsedItems = itemsArray.map(item => {
          const quantityMatch = item.match(/(\d+)x\s+(.+?)(?:\s+@\$(\d+\.\d+))?$/);
          if (quantityMatch) {
            return {
              id: `manual-${Date.now()}-${Math.random()}`,
              name: quantityMatch[2].trim(),
              quantity: parseInt(quantityMatch[1]),
              price: quantityMatch[3] ? parseFloat(quantityMatch[3]) : undefined
            };
          }
          return null;
        }).filter(Boolean) as {id: string; name: string; quantity: number; price?: number}[];
        
        setSelectedItems(parsedItems);
      } catch (error) {
        console.error("Failed to parse initial items:", error);
        setSelectedItems([]);
      }
    } else if (open) {
      setSelectedItems([]);
    }
  }, [open, initialItems]);
  
  const inventoryItems = getInventoryWithProductDetails();
  
  const sortedInventoryItems = [...inventoryItems].sort((a, b) => {
    const rankA = a.product?.is_popular ? (a.product?.popularity_rank || 0) : 999;
    const rankB = b.product?.is_popular ? (b.product?.popularity_rank || 0) : 999;
    return rankA - rankB;
  });
  
  const addItem = (item: any) => {
    const existingItem = selectedItems.find(i => 
      i.id === String(item.product?.id) || i.name === item.product?.name);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        (i.id === String(item.product?.id) || i.name === item.product?.name) 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, {
        id: String(item.product?.id),
        name: item.product?.name || 'Unknown Product',
        quantity: 1,
        price: item.product?.price
      }]);
    }
  };
  
  const removeItem = (item: any) => {
    const existingItem = selectedItems.find(i => 
      i.id === String(item.product?.id) || i.name === item.product?.name);
    
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(selectedItems.map(i => 
        (i.id === String(item.product?.id) || i.name === item.product?.name) 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      setSelectedItems(selectedItems.filter(i => 
        i.id !== String(item.product?.id) && i.name !== item.product?.name));
    }
  };
  
  const formatSelectedItemsForOutput = () => {
    return selectedItems.map(item => 
      `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`
    ).join(', ');
  };
  
  const handleSave = () => {
    const formattedItems = formatSelectedItemsForOutput();
    onSelect(formattedItems, selectedItems, recurrenceData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Items</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 max-h-[60vh] overflow-auto">
          {selectedItems.length > 0 && (
            <div className="border rounded p-3 bg-slate-50">
              <h3 className="font-medium mb-2">Selected Items</h3>
              <ul className="space-y-2">
                {selectedItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item.quantity}x {item.name}</span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedItems(selectedItems.map((i, idx) => 
                            idx === index ? { ...i, quantity: i.quantity - 1 } : i
                          ).filter(i => i.quantity > 0));
                        }}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span>{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedItems(selectedItems.map((i, idx) => 
                            idx === index ? { ...i, quantity: i.quantity + 1 } : i
                          ));
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-2">Available Products</h3>
            {loading ? (
              <p>Loading inventory...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {sortedInventoryItems.filter(item => item.product?.is_popular).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Popular Items</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {sortedInventoryItems
                        .filter(item => item.product?.is_popular)
                        .map((item, index) => (
                          <div key={`popular-${index}`} className="border rounded p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.product?.name}</p>
                              <p className="text-sm text-slate-500">
                                Available: {item.packages_available || 0}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeItem(item)}
                                disabled={!selectedItems.some(i => 
                                  i.id === String(item.product?.id) || i.name === item.product?.name)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>
                                {selectedItems.find(i => 
                                  i.id === String(item.product?.id) || i.name === item.product?.name)?.quantity || 0}
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addItem(item)}
                                disabled={item.packages_available === 0}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <h4 className="text-sm font-medium text-slate-500 mb-2">All Items</h4>
                <div className="grid grid-cols-1 gap-2">
                  {sortedInventoryItems
                    .filter(item => !item.product?.is_popular && item.product)
                    .map((item, index) => (
                      <div key={`item-${index}`} className="border rounded p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-slate-500">
                            Available: {item.packages_available || 0}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeItem(item)}
                            disabled={!selectedItems.some(i => 
                              i.id === String(item.product?.id) || i.name === item.product?.name)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>
                            {selectedItems.find(i => 
                              i.id === String(item.product?.id) || i.name === item.product?.name)?.quantity || 0}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => addItem(item)}
                            disabled={item.packages_available === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Manual Entry</h3>
            <textarea
              className="w-full min-h-[80px] p-2 border rounded"
              value={formatSelectedItemsForOutput()}
              onChange={(e) => {
                try {
                  const itemsArray = e.target.value.split(',').map(item => item.trim());
                  const parsedItems = itemsArray.map(item => {
                    const quantityMatch = item.match(/(\d+)x\s+(.+?)(?:\s+@\$(\d+\.\d+))?$/);
                    if (quantityMatch) {
                      return {
                        id: `manual-${Date.now()}-${Math.random()}`,
                        name: quantityMatch[2].trim(),
                        quantity: parseInt(quantityMatch[1]),
                        price: quantityMatch[3] ? parseFloat(quantityMatch[3]) : undefined
                      };
                    }
                    return null;
                  }).filter(Boolean) as {id: string; name: string; quantity: number; price?: number}[];
                  
                  setSelectedItems(parsedItems);
                } catch (error) {
                  console.error("Failed to parse items:", error);
                }
              }}
              placeholder="e.g., 30x Split Firewood @$7.50, 10x Kindling @$5.00"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
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
