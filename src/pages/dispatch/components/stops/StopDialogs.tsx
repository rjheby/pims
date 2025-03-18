
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CustomerSelector } from "./CustomerSelector";
import { ItemSelector } from "./ItemSelector";
import { Customer } from "./types";
import { RecurrenceData } from "./RecurringOrderForm";

interface StopDialogsProps {
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  onCustomerSelect: (customer: Customer) => void;
  onItemsSelect: (items: string, recurrenceInfo?: RecurrenceData) => void;
  onCancel: () => void;
  initialCustomerId: string | null;
  initialItems: string | null;
  recurrenceData: RecurrenceData;
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
  recurrenceData
}) => {
  // Fix: This ensures dialogs remain open when they should be open
  // The previous implementation had an issue where the dialog would close itself
  const handleOpenChange = (open: boolean, dialogType: 'customer' | 'items') => {
    if (!open) {
      // Only call onCancel when dialog is explicitly closed by user
      onCancel();
    } else {
      // Set the appropriate dialog state
      if (dialogType === 'customer') {
        setCustomerDialogOpen(true);
      } else {
        setItemsDialogOpen(true);
      }
    }
  };

  return (
    <>
      <Dialog 
        open={customerDialogOpen} 
        onOpenChange={(open) => handleOpenChange(open, 'customer')}
      >
        <DialogContent className="sm:max-w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>Choose a customer for this stop</DialogDescription>
          <CustomerSelector 
            onSelect={onCustomerSelect}
            onCancel={onCancel}
            initialCustomerId={initialCustomerId}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={itemsDialogOpen} 
        onOpenChange={(open) => handleOpenChange(open, 'items')}
      >
        <DialogContent className="sm:max-w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Select Items</DialogTitle>
          <DialogDescription>Add items for this delivery</DialogDescription>
          <ItemSelector 
            onSelect={onItemsSelect}
            onCancel={onCancel}
            initialItems={initialItems}
            initialRecurrence={recurrenceData}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
