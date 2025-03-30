import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerDialog } from "./CustomerDialog";
import { ItemSelector } from "./ItemSelector";
import { Customer, RecurrenceData } from "./types";
import { RecurrenceSettingsForm } from "./RecurrenceSettingsForm";

interface StopDialogsProps {
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  onCustomerSelect: (customer: Customer) => void;
  onItemsSelect: (items: string) => void;
  onCancel: () => void;
  initialCustomerId?: string;
  initialItems?: string;
  recurrenceData?: RecurrenceData;
  onRecurrenceChange?: (data: RecurrenceData) => void;
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
  onRecurrenceChange,
  customers
}) => {
  return (
    <>
      <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <CustomerDialog
            onSelect={onCustomerSelect}
            onCancel={() => setCustomerDialogOpen(false)}
            selectedCustomerId={initialCustomerId}
            customers={customers}
          />
        </DialogContent>
      </Dialog>

      <ItemSelector
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
        onSelect={onItemsSelect}
        onCancel={() => setItemsDialogOpen(false)}
        initialItems={initialItems}
        recurrenceData={recurrenceData}
      />
    </>
  );
};
