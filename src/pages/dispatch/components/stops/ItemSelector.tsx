import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecurrenceData } from "./RecurrenceSettingsForm";
import { useRetailInventory } from "@/pages/dispatch/hooks/useRetailInventory";
import { Plus, Minus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  console.log("ItemSelector rendering with props:", { initialItems, recurrenceData });
  
  const { loading, getInventoryWithProductDetails } = useRetailInventory();
  const [selectedItems, setSelectedItems] = useState<{id: string; name: string; quantity: number; price?: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState<'search' | 'attributes'>('search');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  const inventoryItems = useMemo(() => getInventoryWithProductDetails(), [getInventoryWithProductDetails]);
  
  useEffect(() => {
    if (open && initialItems) {
      try {
        const itemsArray = initialItems.split(',').map(item => item.trim());
        console.log("Parsing initial items:", itemsArray);
        
        const parsedItems = itemsArray.map(item => {
          const quantityMatch = item.match(/(\d+)x\s+(.+?)(?:\s+@\$(\d+\.\d+))?$/);
          if (quantityMatch) {
            const parsedItem = {
              id: `manual-${Date.now()}-${Math.random()}`,
              name: quantityMatch[2].trim(),
              quantity: parseInt(quantityMatch[1]),
              price: quantityMatch[3] ? parseFloat(quantityMatch[3]) : undefined
            };
            console.log("Parsed item:", parsedItem);
            return parsedItem;
          }
          console.log("Failed to parse item:", item);
          return null;
        }).filter(Boolean) as {id: string; name: string; quantity: number; price?: number}[];
        
        console.log("Setting selected items:", parsedItems);
        setSelectedItems(parsedItems);
      } catch (error) {
        console.error("Failed to parse initial items:", error);
        setSelectedItems([]);
      }
    } else if (open) {
      setSelectedItems([]);
    }
  }, [open, initialItems]);
  
  console.log("Available inventory items:", inventoryItems.length);
  
  const sortedInventoryItems = useMemo(() => {
    return [...inventoryItems].sort((a, b) => {
      const popularityA = a.product?.is_popular ? (a.product?.popularity_rank || 999) : 999;
      const popularityB = b.product?.is_popular ? (b.product?.popularity_rank || 999) : 999;
      
      if (popularityA !== popularityB) {
        return popularityA - popularityB;
      }
      
      const nameA = a.product?.name?.toLowerCase() || '';
      const nameB = b.product?.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }, [inventoryItems]);
  
  const productTypes = useMemo(() => {
    return [...new Set(inventoryItems
      .map(item => item.product?.sku || undefined)
      .filter(Boolean))];
  }, [inventoryItems]);
  
  const productSizes = useMemo(() => {
    return [...new Set(inventoryItems
      .map(item => {
        if (item.product?.description) {
          const sizeMatch = item.product.description.match(/(\d+"\s*x\s*\d+"\s*x\s*\d+"|\d+\s*bundle|\d+\s*box|\d+\s*pack)/i);
          return sizeMatch ? sizeMatch[0] : undefined;
        }
        return undefined;
      })
      .filter(Boolean))];
  }, [inventoryItems]);
  
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = inventoryItems.filter(item => 
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else if (selectionMode === 'search') {
      setFilteredProducts([]);
    }
  }, [searchTerm, inventoryItems, selectionMode]);
  
  useEffect(() => {
    if (selectionMode === 'attributes' && (selectedProductType || selectedSize)) {
      const filtered = inventoryItems.filter(item => {
        const matchesType = !selectedProductType || item.product?.sku === selectedProductType;
        
        let matchesSize = true;
        if (selectedSize && item.product?.description) {
          matchesSize = item.product.description.toLowerCase().includes(selectedSize.toLowerCase());
        }
        
        return matchesType && matchesSize;
      });
      
      setFilteredProducts(filtered);
    } else if (selectionMode === 'attributes') {
      setFilteredProducts([]);
    }
  }, [selectedProductType, selectedSize, selectionMode, inventoryItems]);
  
  const addItem = useCallback((item: any) => {
    console.log("Adding item:", item);
    setSelectedItems(prev => {
      const existingItem = prev.find(i => 
        i.id === String(item.product?.id) || i.name === item.product?.name);
      
      if (existingItem) {
        console.log("Item already exists, increasing quantity:", existingItem);
        return prev.map(i => 
          (i.id === String(item.product?.id) || i.name === item.product?.name) 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        const newItem = {
          id: String(item.product?.id),
          name: item.product?.name || 'Unknown Product',
          quantity: 1,
          price: item.product?.price
        };
        console.log("Adding new item:", newItem);
        return [...prev, newItem];
      }
    });
  }, []);
  
  const removeItem = useCallback((item: any) => {
    console.log("Removing item:", item);
    setSelectedItems(prev => {
      const existingItem = prev.find(i => 
        i.id === String(item.product?.id) || i.name === item.product?.name);
      
      if (existingItem && existingItem.quantity > 1) {
        console.log("Item exists with multiple quantity, decreasing:", existingItem);
        return prev.map(i => 
          (i.id === String(item.product?.id) || i.name === item.product?.name) 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      } else {
        console.log("Removing item completely");
        return prev.filter(i => 
          i.id !== String(item.product?.id) && i.name !== item.product?.name);
      }
    });
  }, []);
  
  const handleQuantityChange = useCallback((index: number, value: string) => {
    const quantity = parseInt(value) || 0;
    if (quantity >= 0) {
      setSelectedItems(prev => prev.map((item, idx) => 
        idx === index ? { ...item, quantity } : item
      ));
    }
  }, []);
  
  const formatSelectedItemsForOutput = useCallback(() => {
    const formatted = selectedItems.map(item => 
      `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`
    ).join(', ');
    console.log("Formatted items for output:", formatted);
    return formatted;
  }, [selectedItems]);
  
  const handleSave = () => {
    const formattedItems = formatSelectedItemsForOutput();
    console.log("Saving items with complete data:", { 
      formattedItems, 
      selectedItems: JSON.stringify(selectedItems),
      itemCount: selectedItems.length,
      recurrenceData 
    });
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
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="h-8 w-14 text-center"
                      />
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
          
          <div className="flex space-x-2 mb-4">
            <Button 
              variant={selectionMode === 'search' ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectionMode('search')}
              className="flex-1"
            >
              Search
            </Button>
            <Button 
              variant={selectionMode === 'attributes' ? "default" : "outline"} 
              size="sm"
              onClick={() => setSelectionMode('attributes')}
              className="flex-1"
            >
              Filter by Attributes
            </Button>
          </div>
          
          {selectionMode === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Products</label>
                <Select 
                  onValueChange={(value) => {
                    const item = inventoryItems.find(item => String(item.product?.id) === value);
                    if (item) addItem(item);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedInventoryItems.map((item) => (
                      <SelectItem key={item.product?.id} value={String(item.product?.id) || "item-id-missing"}>
                        {item.product?.name} ({item.packages_available} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Search All Products</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search products..."
                    className="pl-8"
                  />
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
          
          {selectionMode === 'attributes' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Type</label>
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type || "unknown-type"}>{type || "Unknown"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {productSizes.map((size) => (
                      <SelectItem key={size} value={size || "unknown-size"}>{size || "Unknown"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Result' : 'Results'}
              </label>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <ul className="divide-y">
                  {filteredProducts.map((item) => (
                    <li 
                      key={item.product?.id} 
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{item.product?.name}</div>
                          <div className="text-sm text-gray-500">Available: {item.packages_available || 0}</div>
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
                          <Input
                            type="number"
                            min="0"
                            className="h-8 w-14 text-center"
                            value={selectedItems.find(i => 
                              i.id === String(item.product?.id) || i.name === item.product?.name)?.quantity || 0}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 0;
                              if (quantity > 0) {
                                const existingItem = selectedItems.find(i => 
                                  i.id === String(item.product?.id) || i.name === item.product?.name);
                                
                                if (existingItem) {
                                  setSelectedItems(selectedItems.map(i => 
                                    (i.id === String(item.product?.id) || i.name === item.product?.name) 
                                      ? { ...i, quantity: quantity }
                                      : i
                                  ));
                                } else {
                                  const newItem = {
                                    id: String(item.product?.id),
                                    name: item.product?.name || 'Unknown Product',
                                    quantity: quantity,
                                    price: item.product?.price
                                  };
                                  setSelectedItems([...selectedItems, newItem]);
                                }
                              } else if (quantity === 0) {
                                setSelectedItems(selectedItems.filter(i => 
                                  i.id !== String(item.product?.id) && i.name !== item.product?.name));
                              }
                            }}
                            disabled={item.packages_available === 0}
                          />
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
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
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
