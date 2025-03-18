import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Customer } from "./types";
import { RecurrenceData } from "./RecurringOrderForm"; // Make sure this import exists
import { ItemsSelector } from "./ItemsSelector"; // Import the ItemsSelector we just created

interface StopDialogsProps {
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  onCustomerSelect: (customer: Customer) => void;
  onItemsSelect: (items: string, recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialCustomerId: string | null;
  initialItems: string | null;
  recurrenceData: RecurrenceData;
  customers: Customer[];
}

export const StopDialogs: React.FC<StopDialogsProps> = ({
  customerDialogOpen,
  setCustomerDialogOpen,
  itemsDialogOpen,
  setItemsDialogOpen,
  onCustomerSelect,
  onItemsSelect,
  onCancel,
  initialCustomerId,
  initialItems,
  recurrenceData,
  customers
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialCustomerId);
  
  // Update selectedCustomerId when initialCustomerId changes
  useEffect(() => {
    setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId]);
  
  const handleCustomerSave = () => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        onCustomerSelect(customer);
      }
    } else {
      onCancel();
    }
  };
  
  return (
    <>
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={selectedCustomerId || undefined} 
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    // Make sure every item has a non-empty value
                    <SelectItem key={customer.id} value={customer.id || "placeholder-value"}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleCustomerSave}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use our new ItemsSelector component */}
      <ItemsSelector
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
        onSelect={onItemsSelect}
        onCancel={onCancel}
        initialItems={initialItems}
        recurrenceData={recurrenceData}
      />
    </>
  );
};
