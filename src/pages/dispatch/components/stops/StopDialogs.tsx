
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomerDialog } from "./CustomerDialog";
import { ItemSelector } from "./ItemSelector";
import { Customer, StopDialogsProps } from "./types";
import { RecurrenceSettingsForm } from "./RecurrenceSettingsForm";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RecurrenceData } from "@/types/recurring";

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
              recurrenceData={recurrenceData as RecurrenceData}
            />
          </ErrorBoundary>
        </DialogContent>
      </Dialog>

      {recurrenceData && onRecurrenceChange && (
        <Dialog open={!!recurrenceData} onOpenChange={() => onRecurrenceChange(undefined as any)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Recurrence Settings</DialogTitle>
            </DialogHeader>
            <ErrorBoundary>
              <RecurrenceSettingsForm
                data={recurrenceData as any}
                onChange={onRecurrenceChange as any}
                onCancel={onCancel}
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
