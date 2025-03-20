
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecurrenceData } from "./RecurringOrderForm";
import { Customer, Driver } from "./types";
import { ItemSelector } from "./ItemSelector";
import { CustomerSelector } from "./CustomerSelector";
import { useToast } from "@/hooks/use-toast";

interface StopDialogsProps {
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  onCustomerSelect: (customer: Customer) => void;
  onItemsSelect: (items: string, itemsData?: any[], recurrenceData?: RecurrenceData) => void;
  onCancel: () => void;
  initialCustomerId: string | null;
  initialItems: string | null;
  recurrenceData: RecurrenceData;
  customers: Customer[];
  drivers?: Driver[]; // Add drivers prop
  initialDriverId?: string | null; // Add initialDriverId prop
  initialNotes?: string | null; // Add initialNotes prop
  onDriverSelect?: (driverId: string | null) => void; // Add driver selection handler
  onNotesChange?: (notes: string | null) => void; // Add notes change handler
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
  customers,
  drivers = [], // Default to empty array
  initialDriverId = null,
  initialNotes = null,
  onDriverSelect,
  onNotesChange
}) => {
  const { toast } = useToast();
  console.log("StopDialogs rendering with props:", { 
    customerDialogOpen, 
    itemsDialogOpen, 
    initialCustomerId,
    initialItems,
    initialDriverId,
    initialNotes,
    customersCount: customers?.length,
    driversCount: drivers?.length
  });
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [cachedItemsData, setCachedItemsData] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState(initialDriverId);
  const [notes, setNotes] = useState(initialNotes);

  // Update selectedCustomerId when initialCustomerId changes
  useEffect(() => {
    console.log("StopDialogs: initialCustomerId changed to:", initialCustomerId);
    setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId]);

  // Update selectedDriverId when initialDriverId changes
  useEffect(() => {
    console.log("StopDialogs: initialDriverId changed to:", initialDriverId);
    setSelectedDriverId(initialDriverId);
  }, [initialDriverId]);

  // Update notes when initialNotes changes
  useEffect(() => {
    console.log("StopDialogs: initialNotes changed to:", initialNotes);
    setNotes(initialNotes);
  }, [initialNotes]);

  // If we have cached items data when items dialog closes, ensure they're saved
  useEffect(() => {
    if (!itemsDialogOpen && cachedItemsData.length > 0) {
      console.log("Items dialog closed with cached items, ensuring they're saved:", cachedItemsData);
      // Format items string from cached data
      const formattedItems = cachedItemsData.map(item => 
        `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`
      ).join(', ');
      
      // Pass both the formatted string and raw data to parent
      onItemsSelect(formattedItems, cachedItemsData, recurrenceData);
      setCachedItemsData([]);
    }
  }, [itemsDialogOpen, cachedItemsData, onItemsSelect, recurrenceData]);

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

  const handleCustomerSelection = (customer: Customer) => {
    console.log("StopDialogs: Customer selected:", customer);
    if (!customer || !customer.id) {
      toast({
        title: "Error",
        description: "Invalid customer selection",
        variant: "destructive"
      });
      return;
    }
    
    onCustomerSelect(customer);
  };

  const handleItemsSelect = (items: string, itemsData?: any[], recurrenceData?: RecurrenceData) => {
    console.log("StopDialogs: Items selected:", items);
    console.log("StopDialogs: itemsData:", itemsData);
    console.log("StopDialogs: recurrenceData:", recurrenceData);
    
    // Ensure itemsData is an array before processing
    const safeItemsData = Array.isArray(itemsData) ? itemsData : [];
    setCachedItemsData(safeItemsData);
    
    // Show a toast confirmation to provide user feedback
    if (safeItemsData.length > 0) {
      toast({
        title: "Items Selected",
        description: `${safeItemsData.length} items added to stop`,
      });
    }
    
    // Always call the parent handler to make sure items are saved
    onItemsSelect(items, safeItemsData, recurrenceData);
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
            onSelect={handleCustomerSelection}
            onCancel={onCancel}
            initialCustomerId={initialCustomerId}
          />
        </DialogContent>
      </Dialog>
      
      <ItemSelector
        open={itemsDialogOpen}
        onOpenChange={(open) => handleOpenChange(open, 'items')}
        onSelect={handleItemsSelect}
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
