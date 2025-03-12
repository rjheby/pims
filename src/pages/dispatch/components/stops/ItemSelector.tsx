
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Plus, Minus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FirewoodProduct, RecurringOrderSettings } from "./types";
import { RecurringOrderForm, RecurrenceData } from "./RecurringOrderForm";

interface ItemSelectorProps {
  onSelect: (items: string, recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialItems?: string | null;
  initialRecurrence?: RecurrenceData;
}

export const ItemSelector = ({
  onSelect,
  onCancel,
  initialItems = null,
  initialRecurrence
}: ItemSelectorProps) => {
  const [products, setProducts] = useState<FirewoodProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number; name: string }[]>([]);
  const [customItems, setCustomItems] = useState<{ name: string; quantity: number }[]>([]);
  const [customItemInput, setCustomItemInput] = useState("");
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>(
    initialRecurrence || { isRecurring: false, frequency: 'none' }
  );

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('firewood_products')
          .select('*')
          .order('item_name');
          
        if (error) {
          throw error;
        }
        
        setProducts(data || []);
        
        // Parse initial items if they exist
        if (initialItems) {
          parseInitialItems(initialItems);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [initialItems]);
  
  const parseInitialItems = (itemsString: string) => {
    const parsedItems: { productId: number; quantity: number; name: string }[] = [];
    const parsedCustomItems: { name: string; quantity: number }[] = [];
    
    // Parse format like "2x Firewood - 1/4 cord, 1x Kindling bundle"
    const itemsList = itemsString.split(',').map(item => item.trim()).filter(Boolean);
    
    itemsList.forEach(item => {
      // Extract quantity and description
      const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
      const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
      const description = quantityMatch ? quantityMatch[2] : item;
      
      // Check if it matches any product in our database
      const product = products.find(p => 
        p.item_full_name === description || 
        p.item_name === description
      );
      
      if (product) {
        parsedItems.push({
          productId: product.id,
          quantity,
          name: product.item_full_name
        });
      } else {
        // If no match, treat as custom item
        parsedCustomItems.push({
          name: description,
          quantity
        });
      }
    });
    
    setSelectedItems(parsedItems);
    setCustomItems(parsedCustomItems);
  };

  const handleAddCustomItem = () => {
    if (!customItemInput.trim()) return;
    
    setCustomItems([...customItems, { name: customItemInput.trim(), quantity: 1 }]);
    setCustomItemInput("");
  };

  const handleRemoveCustomItem = (index: number) => {
    const newItems = [...customItems];
    newItems.splice(index, 1);
    setCustomItems(newItems);
  };

  const handleSelectProduct = (product: FirewoodProduct) => {
    // Check if already in selected items
    const existingIndex = selectedItems.findIndex(item => item.productId === product.id);
    
    if (existingIndex >= 0) {
      // Increment quantity if already selected
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity += 1;
      setSelectedItems(newItems);
    } else {
      // Add new selection
      setSelectedItems([...selectedItems, {
        productId: product.id,
        quantity: 1,
        name: product.item_full_name
      }]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleQuantityChange = (index: number, increment: boolean, isCustom: boolean = false) => {
    if (isCustom) {
      const newItems = [...customItems];
      if (increment) {
        newItems[index].quantity += 1;
      } else if (newItems[index].quantity > 1) {
        newItems[index].quantity -= 1;
      }
      setCustomItems(newItems);
    } else {
      const newItems = [...selectedItems];
      if (increment) {
        newItems[index].quantity += 1;
      } else if (newItems[index].quantity > 1) {
        newItems[index].quantity -= 1;
      }
      setSelectedItems(newItems);
    }
  };

  const handleConfirm = () => {
    // Combine selected products and custom items
    const formattedItems = [
      ...selectedItems.map(item => `${item.quantity}x ${item.name}`),
      ...customItems.map(item => `${item.quantity}x ${item.name}`)
    ].join(', ');
    
    console.log("Saving items:", formattedItems);
    console.log("Recurrence data:", recurrenceData);
    onSelect(formattedItems, recurrenceData);
  };

  const handleRecurrenceChange = (data: RecurrenceData) => {
    setRecurrenceData(data);
  };

  const filteredProducts = products.filter(product => 
    product.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    product.item_full_name?.toLowerCase().includes(search.toLowerCase()) ||
    product.species?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-h-[70vh] flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      
      {/* Selected Items */}
      {(selectedItems.length > 0 || customItems.length > 0) && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <h3 className="font-medium mb-2">Selected Items</h3>
          <div className="space-y-2">
            {selectedItems.map((item, index) => (
              <div key={`product-${item.productId}`} className="flex items-center justify-between bg-white p-2 rounded border">
                <div>{item.name}</div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(index, false)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(index, true)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveProduct(index)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {customItems.map((item, index) => (
              <div key={`custom-${index}`} className="flex items-center justify-between bg-white p-2 rounded border">
                <div>{item.name} <span className="text-xs text-muted-foreground">(Custom)</span></div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(index, false, true)}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuantityChange(index, true, true)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveCustomItem(index)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Custom Item Input */}
      <div className="mb-4 flex space-x-2">
        <Input
          placeholder="Add custom item..."
          value={customItemInput}
          onChange={(e) => setCustomItemInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
        />
        <Button onClick={handleAddCustomItem} type="button">
          Add
        </Button>
      </div>
      
      {/* Product List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 max-h-[30vh]">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No products found. Add a custom item instead.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`
                    p-3 rounded-md cursor-pointer border hover:bg-accent
                    ${selectedItems.some(item => item.productId === product.id) 
                      ? 'bg-primary/10 border-primary' 
                      : ''}
                  `}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="font-medium">{product.item_full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {[
                      product.species && `Species: ${product.species}`,
                      product.length && `Length: ${product.length}`,
                      product.split_size && `Split Size: ${product.split_size}`
                    ].filter(Boolean).join(' | ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Recurring Order Options */}
      <RecurringOrderForm 
        onRecurrenceChange={handleRecurrenceChange}
        initialRecurrence={initialRecurrence}
      />
      
      <div className="flex justify-end space-x-2 mt-auto pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={selectedItems.length === 0 && customItems.length === 0}
        >
          {recurrenceData.isRecurring ? 'Set Up Recurring Order' : 'Place Order'}
        </Button>
      </div>
    </div>
  );
};
