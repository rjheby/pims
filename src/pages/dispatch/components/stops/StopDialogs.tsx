
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerDialog } from "./CustomerDialog";
import { ItemSelector } from "./ItemSelector";
import { RecurrenceSettingsForm } from "./RecurrenceSettingsForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Customer, RecurrenceData } from "@/types";

export interface StopDialogsProps {
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
          <ErrorBoundary>
            <CustomerDialog
              onSelect={onCustomerSelect}
              onCancel={() => setCustomerDialogOpen(false)}
              selectedCustomerId={initialCustomerId}
              customers={customers}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Items</DialogTitle>
          </DialogHeader>
          <ErrorBoundary>
            <ItemSelector
              onSelect={onItemsSelect}
              onCancel={() => setItemsDialogOpen(false)}
              initialItems={initialItems}
              open={itemsDialogOpen}
              onOpenChange={setItemsDialogOpen}
              recurrenceData={recurrenceData}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      {recurrenceData && onRecurrenceChange && (
        <Dialog open={!!recurrenceData} onOpenChange={() => onRecurrenceChange(undefined)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recurrence Settings</DialogTitle>
            </DialogHeader>
            <ErrorBoundary>
              <RecurrenceSettingsForm
                data={recurrenceData}
                onChange={onRecurrenceChange}
                onCancel={onCancel}
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
