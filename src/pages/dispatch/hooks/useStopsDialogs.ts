import { useState, useCallback, useMemo } from "react";
import { Customer, DeliveryStop, Driver, StopFormData, RecurrenceData } from "../components/stops/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useStopsDialogs(
  stops: DeliveryStop[],
  onStopsChange: (stops: DeliveryStop[]) => void,
  customers: Customer[],
  drivers: Driver[]
) {
  const { toast } = useToast();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<StopFormData>({
    stop_number: 0,
    customer_id: "",
    customer_name: "",
    customer_address: "",
    driver_id: "",
    driver_name: "",
    items: "",
    notes: "",
    price: "",
    is_recurring: false,
    recurring_id: ""
  });
  
  // Create a stable recurrenceData object using useMemo
  const [recurrenceDataState, setRecurrenceDataState] = useState<RecurrenceData>({
    isRecurring: false,
    frequency: "weekly",
    preferredDay: "monday"
  });

  // Memoize recurrenceData to prevent unnecessary re-renders
  const recurrenceData = useMemo(() => recurrenceDataState, [recurrenceDataState]);

  const handleAddStop = useCallback(() => {
    console.log("Adding new stop");
    setIsAddingNewStop(true);
    setEditingIndex(null);
    
    const newStopNumber = stops.length > 0 
      ? Math.max(...stops.map(s => s.stop_number || 0)) + 1 
      : 1;
      
    setEditForm({
      stop_number: newStopNumber,
      customer_id: "",
      customer_name: "",
      customer_address: "",
      driver_id: "",
      driver_name: "",
      items: "",
      notes: "",
      price: "",
      is_recurring: false,
      recurring_id: ""
    });
    
    setRecurrenceDataState({
      isRecurring: false,
      frequency: "weekly",
      preferredDay: "monday"
    });
    
    setCustomerDialogOpen(true);
  }, [stops, setCustomerDialogOpen]);

  const handleEditStart = useCallback((index: number) => {
    console.log("Editing stop at index:", index);
    const stop = stops[index];
    setEditingIndex(index);
    setIsAddingNewStop(false);
    
    setEditForm({
      id: stop.id,
      stop_number: stop.stop_number,
      customer_id: stop.customer_id || "",
      customer_name: stop.customer_name || "",
      customer_address: stop.customer_address || "",
      driver_id: stop.driver_id || "",
      driver_name: stop.driver_name || "",
      items: stop.items || "",
      notes: stop.notes || "",
      price: stop.price || "",
      is_recurring: stop.is_recurring || false,
      recurring_id: stop.recurring_id || ""
    });
  }, [stops]);

  const handleEditSave = useCallback(() => {
    if (editForm.customer_id) {
      if (editingIndex !== null) {
        console.log("Saving edits to existing stop");
        const newStops = [...stops];
        newStops[editingIndex] = {
          ...newStops[editingIndex],
          ...editForm,
          // If this is a recurring stop, update recurring_id and is_recurring flags
          ...(recurrenceData.isRecurring && {
            is_recurring: true
          })
        };
        onStopsChange(newStops);
      } else if (isAddingNewStop) {
        console.log("Adding new stop to collection");
        const newStop: DeliveryStop = {
          ...editForm,
          // If this is a recurring stop, add recurring properties
          ...(recurrenceData.isRecurring && {
            is_recurring: true
          }),
          stop_number: editForm.stop_number
        };
        
        onStopsChange([...stops, newStop]);
        
        // If it's a recurring stop, save it to the recurring_orders table
        if (recurrenceData.isRecurring) {
          saveRecurringOrder();
        }
      }
    }
    
    setEditingIndex(null);
    setIsAddingNewStop(false);
  }, [stops, editForm, editingIndex, isAddingNewStop, onStopsChange, recurrenceData]);

  const saveRecurringOrder = async () => {
    if (!editForm.customer_id || !recurrenceData.isRecurring) return;
    
    try {
      const { data, error } = await supabase
        .from("recurring_orders")
        .insert({
          customer_id: editForm.customer_id,
          frequency: recurrenceData.frequency,
          preferred_day: recurrenceData.preferredDay,
          preferred_time: "morning" // Default to morning
        })
        .select();
      
      if (error) throw error;
      
      console.log("Created recurring order:", data);
      
      // Update the stop with the recurring_id
      if (data && data[0].id) {
        const updatedStops = stops.map(stop => {
          if (stop.customer_id === editForm.customer_id) {
            return {
              ...stop,
              recurring_id: data[0].id,
              is_recurring: true
            };
          }
          return stop;
        });
        
        onStopsChange(updatedStops);
        
        toast({
          title: "Success",
          description: "Recurring order saved and linked to this stop",
        });
      }
    } catch (error: any) {
      console.error("Error saving recurring order:", error);
      toast({
        title: "Error",
        description: "Failed to save recurring order: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditCancel = useCallback(() => {
    console.log("Canceling edit");
    setEditingIndex(null);
    setIsAddingNewStop(false);
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
  }, []);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    console.log("Selected customer:", customer);
    setEditForm(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_address: customer.address || 
        [customer.street_address, customer.city, customer.state, customer.zip_code]
          .filter(Boolean)
          .join(", ")
    }));
    
    setCustomerDialogOpen(false);
    setItemsDialogOpen(true);
  }, []);

  const handleItemsSelect = useCallback((items: string, itemsData?: any[], recurrenceDataUpdate?: RecurrenceData) => {
    console.log("Selected items:", items);
    
    // If recurrence data was updated through the ItemSelector, update it here
    if (recurrenceDataUpdate) {
      setRecurrenceDataState(recurrenceDataUpdate);
    }
    
    // Simple price calculation (can be enhanced)
    const itemsArray = items.split(',').filter(Boolean);
    const basePrice = 10;
    const calculatedPrice = itemsArray.length * basePrice;
    
    setEditForm(prev => ({
      ...prev,
      items,
      price: calculatedPrice
    }));
    
    setItemsDialogOpen(false);
  }, []);

  const openCustomerDialog = useCallback((index?: number) => {
    if (index !== undefined) {
      handleEditStart(index);
    }
    setCustomerDialogOpen(true);
  }, [handleEditStart]);

  const openItemsDialog = useCallback((index?: number) => {
    if (index !== undefined && editingIndex !== index) {
      handleEditStart(index);
    }
    setItemsDialogOpen(true);
  }, [handleEditStart, editingIndex]);

  const handleRecurrenceChange = useCallback((data: RecurrenceData) => {
    setRecurrenceDataState(data);
  }, []);

  return {
    editingIndex,
    isAddingNewStop,
    customerDialogOpen,
    setCustomerDialogOpen,
    itemsDialogOpen,
    setItemsDialogOpen,
    editForm,
    setEditForm,
    recurrenceData,
    handleRecurrenceChange,
    handleAddStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleCustomerSelect,
    handleItemsSelect,
    openCustomerDialog,
    openItemsDialog
  };
}
