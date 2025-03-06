
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, Search } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { FirewoodProduct } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ItemSelectorProps {
  onSelect: (items: string) => void;
  onCancel: () => void;
  initialItems?: string | null;
}

interface SelectedItem {
  id: number;
  name: string;
  quantity: number;
}

export function ItemSelector({ onSelect, onCancel, initialItems }: ItemSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [customItem, setCustomItem] = useState<string>('');
  const [firewoodProducts, setFirewoodProducts] = useState<FirewoodProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<FirewoodProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<FirewoodProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize from props if available
  useEffect(() => {
    if (initialItems) {
      const itemsArray = initialItems.split(',').map(item => item.trim()).filter(Boolean);
      
      // Try to parse quantity from format like "2x Firewood - 1/4 cord"
      const parsedItems = itemsArray.map(itemText => {
        const quantityMatch = itemText.match(/^(\d+)x\s+(.+)$/);
        if (quantityMatch) {
          return {
            id: -1, // Custom ID for non-database items
            name: quantityMatch[2],
            quantity: parseInt(quantityMatch[1], 10)
          };
        }
        return {
          id: -1,
          name: itemText,
          quantity: 1
        };
      });
      
      setSelectedItems(parsedItems);
    }
  }, [initialItems]);
  
  // Fetch products from database
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        const { data: products, error } = await supabase
          .from('firewood_products')
          .select('*')
          .order('item_full_name');
          
        if (error) throw error;
        
        if (products) {
          setFirewoodProducts(products);
          
          // Set popular products (for demo - in real app this would be based on order frequency)
          setPopularProducts(products.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching firewood products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = firewoodProducts.filter(product => 
        product.item_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, firewoodProducts]);
  
  // Add product from database
  const addProduct = (product: FirewoodProduct) => {
    const existingItemIndex = selectedItems.findIndex(item => 
      item.id === product.id || item.name === product.item_full_name
    );
    
    if (existingItemIndex >= 0) {
      // Increment quantity if already in cart
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Add new item with quantity 1
      setSelectedItems([...selectedItems, {
        id: product.id,
        name: product.item_full_name,
        quantity: 1
      }]);
    }
  };
  
  // Add custom item to selection
  const addCustomItem = () => {
    if (customItem.trim()) {
      const existingItemIndex = selectedItems.findIndex(item => item.name === customItem.trim());
      
      if (existingItemIndex >= 0) {
        // Increment quantity if already in cart
        const updatedItems = [...selectedItems];
        updatedItems[existingItemIndex].quantity += 1;
        setSelectedItems(updatedItems);
      } else {
        setSelectedItems([...selectedItems, {
          id: -1,
          name: customItem.trim(),
          quantity: 1
        }]);
      }
      setCustomItem('');
    }
  };
  
  // Update quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = quantity;
    setSelectedItems(updatedItems);
  };
  
  // Remove an item from selection
  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };
  
  // Handle submission
  const handleSelect = () => {
    // Format items for storage: "2x Firewood - 1/4 cord, 1x Kindling bundle" 
    const formattedItems = selectedItems.map(item => 
      `${item.quantity}x ${item.name}`
    ).join(', ');
    
    onSelect(formattedItems);
  };
  
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Select Items</DialogTitle>
        <DialogDescription>
          Choose firewood products for this delivery stop
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="products">Firewood Products</TabsTrigger>
          <TabsTrigger value="custom">Custom Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium mb-1">Search Products</label>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or species..."
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Popular products */}
          {!searchTerm && (
            <div>
              <h3 className="text-sm font-medium mb-2">Popular Products</h3>
              <div className="grid grid-cols-1 gap-2">
                {popularProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex items-center justify-between border rounded-md p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => addProduct(product)}
                  >
                    <div>
                      <div className="font-medium">{product.item_full_name}</div>
                      <div className="text-xs text-gray-500">{product.product_type} - {product.length}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search results */}
          {filteredProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Result' : 'Results'}
              </h3>
              <div className="max-h-40 overflow-y-auto border rounded-md">
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProduct(product)}
                    >
                      <div>
                        <div className="font-medium">{product.item_full_name}</div>
                        <div className="text-xs text-gray-500">{product.product_type} - {product.length}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          {/* Custom Item */}
          <div>
            <label className="block text-sm font-medium mb-1">Add Custom Item</label>
            <div className="flex space-x-2">
              <Input
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                placeholder="Enter custom item description..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomItem();
                  }
                }}
              />
              <Button 
                onClick={addCustomItem}
                disabled={!customItem.trim()}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Common Items */}
          <div>
            <h3 className="text-sm font-medium mb-2">Common Custom Items</h3>
            <div className="grid grid-cols-1 gap-2">
              {["Firewood - 1/4 cord", "Firewood - 1/2 cord", "Firewood - Full cord", "Kindling bundle", "Cedar bundle", "Firestarter box"].map((item) => (
                <div 
                  key={item} 
                  className="flex items-center justify-between border rounded-md p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setCustomItem(item);
                    addCustomItem();
                  }}
                >
                  <span>{item}</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Selected Items</h3>
          <ul className="space-y-1 border rounded-md p-2 max-h-40 overflow-y-auto">
            {selectedItems.map((item, index) => (
              <li key={index} className="flex items-center justify-between text-sm p-1 hover:bg-gray-50 rounded">
                <span className="flex-1">{item.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-md">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value, 10) || 1)}
                      className="w-12 h-7 text-center p-0 border-0"
                      min="1"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeItem(index)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
        <Button onClick={handleSelect}>
          Confirm Selection
        </Button>
      </div>
    </div>
  );
}
