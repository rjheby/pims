
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
  debugMode?: boolean; // Add debug mode prop
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
  onNotesChange,
  debugMode = false
}) => {
  const { toast } = useToast();
  
  if (debugMode) {
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
  }
  
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [selectedItemsData, setSelectedItemsData] = useState<any[]>([]);
  const [cachedItemsData, setCachedItemsData] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState(initialDriverId);
  const [notes, setNotes] = useState(initialNotes);

  // Update selectedCustomerId when initialCustomerId changes
  useEffect(() => {
    if (debugMode) {
      console.log("StopDialogs: initialCustomerId changed to:", initialCustomerId);
    }
    setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId, debugMode]);

  // Update selectedDriverId when initialDriverId changes
  useEffect(() => {
    if (debugMode) {
      console.log("StopDialogs: initialDriverId changed to:", initialDriverId);
    }
    setSelectedDriverId(initialDriverId);
  }, [initialDriverId, debugMode]);

  // Update notes when initialNotes changes
  useEffect(() => {
    if (debugMode) {
      console.log("StopDialogs: initialNotes changed to:", initialNotes);
    }
    setNotes(initialNotes);
  }, [initialNotes, debugMode]);

  // If we have cached items data when items dialog closes, ensure they're saved
  useEffect(() => {
    if (!itemsDialogOpen && cachedItemsData.length > 0) {
      if (debugMode) {
        console.log("Items dialog closed with cached items, ensuring they're saved:", cachedItemsData);
      }
      // Format items string from cached data
      const formattedItems = cachedItemsData.map(item => 
        `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`
      ).join(', ');
      
      // Pass both the formatted string and raw data to parent
      onItemsSelect(formattedItems, cachedItemsData, recurrenceData);
      setCachedItemsData([]);
    }
  }, [itemsDialogOpen, cachedItemsData, onItemsSelect, recurrenceData, debugMode]);

  // Add a handler for dialog open/close events
  const handleOpenChange = (open: boolean, dialogType: 'customer' | 'items') => {
    if (debugMode) {
      console.log(`${dialogType} dialog openChange event:`, open);
    }
    if (dialogType === 'customer') {
      if (!open && debugMode) {
        console.log("Customer dialog closing via UI interaction");
      }
      setCustomerDialogOpen(open);
    } else {
      if (!open && debugMode) {
        console.log("Items dialog closing via UI interaction");
      }
      setItemsDialogOpen(open);
    }
  };

  const handleCustomerSelection = (customer: Customer) => {
    if (debugMode) {
      console.log("StopDialogs: Customer selected:", customer);
    }
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
    if (debugMode) {
      console.log("StopDialogs: Items selected:", items);
      console.log("StopDialogs: itemsData:", itemsData);
      console.log("StopDialogs: recurrenceData:", recurrenceData);
    }
    
    // Ensure itemsData is an array before processing
    const safeItemsData = Array.isArray(itemsData) ? itemsData : [];
    setSelectedItemsData(safeItemsData);
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
            debugMode={debugMode}
          />
        </DialogContent>
      </Dialog>
      
      <ItemSelector
        open={itemsDialogOpen}
        onOpenChange={(open) => handleOpenChange(open, 'items')}
        onSelect={handleItemsSelect}
        onCancel={() => {
          if (debugMode) console.log("Cancel called from ItemSelector");
          onCancel();
        }}
        initialItems={initialItems}
        recurrenceData={recurrenceData}
        debugMode={debugMode}
      />
    </>
  );
};

// Export the ItemSelector from this file
export { ItemSelector } from "./ItemSelector";
