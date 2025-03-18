
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
  return (
    <>
      <Dialog 
        open={customerDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            onCancel();
          } else {
            setCustomerDialogOpen(open);
          }
        }}
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
        onOpenChange={(open) => {
          if (!open) {
            onCancel();
          } else {
            setItemsDialogOpen(open);
          }
        }}
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
