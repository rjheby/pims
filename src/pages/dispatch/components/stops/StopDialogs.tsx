import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecurrenceData } from "./RecurringOrderForm";
import { Customer, Driver } from "./types";
import { ItemSelector } from "./ItemSelector";
import { CustomerSelector } from "./CustomerSelector";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RecurringOrderForm } from "./RecurringOrderForm";
import { Button } from "@/components/ui/button";
import { DriverSelector } from "./DriverSelector";

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
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [localRecurrenceData, setLocalRecurrenceData] = useState(recurrenceData);

  useEffect(() => {
    console.log("StopDialogs: initialCustomerId changed to:", initialCustomerId);
    setSelectedCustomerId(initialCustomerId);
  }, [initialCustomerId]);

  useEffect(() => {
    console.log("StopDialogs: initialDriverId changed to:", initialDriverId);
    setSelectedDriverId(initialDriverId);
  }, [initialDriverId]);

  useEffect(() => {
    console.log("StopDialogs: initialNotes changed to:", initialNotes);
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    console.log("StopDialogs: recurrenceData changed:", recurrenceData);
    setLocalRecurrenceData(recurrenceData);
  }, [recurrenceData]);

  useEffect(() => {
    if (!itemsDialogOpen && cachedItemsData.length > 0) {
      console.log("Items dialog closed with cached items, ensuring they're saved:", cachedItemsData);
      const formattedItems = cachedItemsData.map(item => 
        `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`
      ).join(', ');
      
      onItemsSelect(formattedItems, cachedItemsData, localRecurrenceData);
      setCachedItemsData([]);
    }
  }, [itemsDialogOpen, cachedItemsData, onItemsSelect, localRecurrenceData]);

  const handleOpenChange = (open: boolean, dialogType: 'customer' | 'items' | 'driver') => {
    console.log(`${dialogType} dialog openChange event:`, open);
    if (dialogType === 'customer') {
      if (!open) {
        console.log("Customer dialog closing via UI interaction");
      }
      setCustomerDialogOpen(open);
    } else if (dialogType === 'items') {
      if (!open) {
        console.log("Items dialog closing via UI interaction");
      }
      setItemsDialogOpen(open);
    } else if (dialogType === 'driver') {
      setDriverDialogOpen(open);
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
    
    const safeItemsData = Array.isArray(itemsData) ? itemsData : [];
    setCachedItemsData(safeItemsData);
    
    if (recurrenceData) {
      setLocalRecurrenceData(recurrenceData);
    }
    
    if (safeItemsData.length > 0) {
      toast({
        title: "Items Selected",
        description: `${safeItemsData.length} items added to stop`,
      });
    }
    
    onItemsSelect(items, safeItemsData, recurrenceData || localRecurrenceData);
  };

  const handleDriverChange = (driverId: string | null) => {
    console.log("Driver changed to:", driverId);
    setSelectedDriverId(driverId);
    
    if (onDriverSelect) {
      onDriverSelect(driverId);
    }
    
    // Show a toast to confirm driver selection
    const driverName = driverId ? drivers.find(d => d.id === driverId)?.name || "Unknown" : "None";
    toast({
      title: "Driver Assigned",
      description: `Assigned driver: ${driverName}`
    });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    if (onNotesChange) {
      onNotesChange(newNotes);
    }
  };
  
  const handleRecurrenceChange = (newRecurrenceData: RecurrenceData) => {
    console.log("Recurrence data changed:", newRecurrenceData);
    setLocalRecurrenceData(newRecurrenceData);
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
      
      {itemsDialogOpen && (
        <ItemSelector
          open={itemsDialogOpen}
          onOpenChange={(open) => handleOpenChange(open, 'items')}
          onSelect={handleItemsSelect}
          onCancel={() => {
            console.log("Cancel called from ItemSelector");
            onCancel();
          }}
          initialItems={initialItems}
          recurrenceData={localRecurrenceData}
        />
      )}
      
      <Dialog 
        open={driverDialogOpen} 
        onOpenChange={(open) => handleOpenChange(open, 'driver')}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Assign Driver</Label>
              <Select 
                value={selectedDriverId || ''} 
                onValueChange={(value) => handleDriverChange(value || null)}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Notes</Label>
              <Input
                id="notes"
                value={notes || ''}
                onChange={handleNotesChange}
                placeholder="Add any special instructions for this delivery"
              />
            </div>
            
            <RecurringOrderForm
              recurrenceData={localRecurrenceData}
              onRecurrenceChange={handleRecurrenceChange}
              initialRecurrence={recurrenceData}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDriverDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDriverDialogOpen(false)}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ItemSelector } from "./ItemSelector";
