
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RecurrenceData } from "./RecurringOrderForm";
import { Customer } from "./types";
import { ItemSelector } from "./ItemSelector";

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
  console.log("StopDialogs rendering with props:", { 
    customerDialogOpen, 
    itemsDialogOpen, 
    initialCustomerId,
    customersCount: customers?.length 
  });
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);

  // Update selectedCustomerId when initialCustomerId changes
  useEffect(() => {
    console.log("StopDialogs: initialCustomerId changed to:", initialCustomerId);
    setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId]);

  const handleCustomerSave = () => {
    console.log("Customer save button clicked, selectedCustomerId:", selectedCustomerId);
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      if (customer) {
        console.log("Selected customer found:", customer.name);
        onCustomerSelect(customer);
      } else {
        console.error("Selected customer not found in customers list");
        onCancel();
      }
    } else {
      console.log("No customer selected, cancelling");
      onCancel();
    }
  };

  // Add a handler for dialog open/close events
  const handleOpenChange = (open: boolean, dialogType: 'customer' | 'items') => {
    console.log(`${dialogType} dialog openChange event:`, open);
    if (dialogType === 'customer') {
      if (!open) {
        console.log("Customer dialog closing via UI interaction");
      }
      setCustomerDialogOpen(open);
    } else {
      if (!open) {
        console.log("Items dialog closing via UI interaction");
      }
      setItemsDialogOpen(open);
    }
  };

  return (
    <>
      <Dialog 
        open={customerDialogOpen} 
        onOpenChange={(open) => handleOpenChange(open, 'customer')}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select 
                value={selectedCustomerId || undefined} 
                onValueChange={(value) => {
                  console.log("Customer select value changed to:", value);
                  setSelectedCustomerId(value);
                }}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    // Make sure every customer has a valid non-empty ID
                    <SelectItem
                      key={customer.id}
                      value={customer.id || "placeholder-value-" + Math.random()}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              console.log("Cancel button clicked in customer dialog");
              onCancel();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCustomerSave}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ItemSelector
        open={itemsDialogOpen}
        onOpenChange={(open) => handleOpenChange(open, 'items')}
        onSelect={(items, recurrenceData) => {
          console.log("Items selected:", items);
          onItemsSelect(items, recurrenceData);
        }}
        onCancel={() => {
          console.log("Cancel called from ItemSelector");
          onCancel();
        }}
        initialItems={initialItems}
        recurrenceData={recurrenceData}
      />
    </>
  );
};

// Export the ItemSelector from this file
export { ItemSelector } from "./ItemSelector";
