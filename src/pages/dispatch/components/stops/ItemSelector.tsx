
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus } from 'lucide-react';

interface ItemSelectorProps {
  onSelect: (items: string) => void;
  onCancel: () => void;
  initialItems?: string | null;
}

// Common item options
const COMMON_ITEMS = [
  "Firewood - 1/4 cord",
  "Firewood - 1/2 cord",
  "Firewood - Full cord",
  "Kindling bundle",
  "Cedar bundle",
  "Firestarter box"
];

export function ItemSelector({ onSelect, onCancel, initialItems }: ItemSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customItem, setCustomItem] = useState<string>('');
  
  // Initialize from props if available
  useEffect(() => {
    if (initialItems) {
      setSelectedItems(initialItems.split(',').map(item => item.trim()).filter(Boolean));
    }
  }, [initialItems]);
  
  // Toggle selection of a common item
  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  // Add custom item to selection
  const addCustomItem = () => {
    if (customItem.trim() && !selectedItems.includes(customItem.trim())) {
      setSelectedItems([...selectedItems, customItem.trim()]);
      setCustomItem('');
    }
  };
  
  // Remove an item from selection
  const removeItem = (item: string) => {
    setSelectedItems(selectedItems.filter(i => i !== item));
  };
  
  // Handle submission
  const handleSelect = () => {
    onSelect(selectedItems.join(', '));
  };
  
  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Select Items</DialogTitle>
        <DialogDescription>
          Choose items for this delivery stop
        </DialogDescription>
      </DialogHeader>
      
      {/* Common Items */}
      <div>
        <h3 className="text-sm font-medium mb-2">Common Items</h3>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_ITEMS.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox 
                id={`item-${item}`} 
                checked={selectedItems.includes(item)}
                onCheckedChange={() => toggleItem(item)}
              />
              <Label htmlFor={`item-${item}`} className="text-sm cursor-pointer">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Custom Item */}
      <div>
        <h3 className="text-sm font-medium mb-2">Add Custom Item</h3>
        <div className="flex space-x-2">
          <Input
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Enter custom item..."
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
      
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Selected Items</h3>
          <ul className="space-y-1 border rounded-md p-2 max-h-40 overflow-y-auto">
            {selectedItems.map((item) => (
              <li key={item} className="flex items-center justify-between text-sm p-1 hover:bg-gray-50 rounded">
                <span>{item}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeItem(item)}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
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
