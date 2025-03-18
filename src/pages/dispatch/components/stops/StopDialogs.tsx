
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecurrenceData } from "./RecurringOrderForm";
import { Customer } from "./types";
import { ItemSelector } from "./ItemSelector";
import { CustomerSelector } from "./CustomerSelector";

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
          
          <CustomerSelector
            onSelect={onCustomerSelect}
            onCancel={onCancel}
            initialCustomerId={initialCustomerId}
          />
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
