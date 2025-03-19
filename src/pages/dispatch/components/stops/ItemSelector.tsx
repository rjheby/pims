
import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecurrenceData } from "./RecurringOrderForm";

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
  const [itemsText, setItemsText] = useState(initialItems || '');
  // Placeholder for item data that would come from a real input form
  const [itemsData, setItemsData] = useState<any[]>([
    { id: 1, name: 'Split Firewood', quantity: 30, price: 7.50 }
  ]);
  
  useEffect(() => {
    if (open) {
      setItemsText(initialItems || '');
    }
  }, [open, initialItems]);
  
  const handleSave = () => {
    onSelect(itemsText, itemsData, recurrenceData);
  };
  
  const handleCancel = () => {
    onCancel();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="items" className="text-sm font-medium">
              Items (comma separated)
            </label>
            <textarea
              id="items"
              className="w-full min-h-[100px] p-2 border rounded"
              value={itemsText}
              onChange={(e) => setItemsText(e.target.value)}
              placeholder="e.g., 30x Split Firewood @$7.50, 10x Kindling @$5.00"
            />
          </div>
          
          {/* Simplified placeholder for actual item selection UI */}
          <div className="border rounded p-3 bg-gray-50">
            <p className="text-sm text-gray-500">
              This is a placeholder for a more advanced item selection UI that would allow adding items with quantities and prices.
            </p>
          </div>
        </div>
        
        <DialogFooter>
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
