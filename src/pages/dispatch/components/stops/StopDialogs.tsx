import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerDialog } from "./CustomerDialog";
import { ItemSelector } from "./ItemSelector";
import { Customer, RecurrenceData, StopDialogsProps } from "./types";
import { RecurrenceSettingsForm } from "./RecurrenceSettingsForm";
import ErrorBoundary from "@/components/ErrorBoundary";

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
              open={itemsDialogOpen}
              onOpenChange={setItemsDialogOpen}
              onSelect={onItemsSelect}
              onCancel={() => setItemsDialogOpen(false)}
              initialItems={initialItems}
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
                recurrenceData={recurrenceData}
                onRecurrenceChange={onRecurrenceChange}
                onCancel={onCancel}
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
