
import { useState, useCallback } from "react";
import { Customer, Driver, DeliveryStop } from "@/types";
import { StopFormData } from "@/types/delivery";
import { DeliveryStatus } from "@/types/status";
import { RecurrenceData } from "@/types/recurring";

interface UseStopsDialogsProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  customers: Customer[];
  drivers: Driver[];
  initialCustomerId?: string;
  initialItems?: string;
  masterScheduleId?: string;
}

export const useStopsDialogs = ({
  stops,
  onStopsChange,
  customers,
  drivers,
  initialCustomerId = "",
  initialItems = "",
  masterScheduleId,
}: UseStopsDialogsProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer: initialCustomerId || "",
    client_id: initialCustomerId || "",
    driver: "",
    notes: "",
    is_recurring: false,
    recurrence_frequency: "weekly",
    preferred_day: "monday",
    next_occurrence_date: null,
    recurrence_end_date: null,
    stop_number: stops.length + 1,
    items: initialItems || "",
  });
  
  const resetForm = useCallback(() => {
    setEditForm({
      customer: "",
      client_id: "",
      driver: "",
      notes: "",
      is_recurring: false,
      recurrence_frequency: "weekly",
      preferred_day: "monday",
      next_occurrence_date: null,
      recurrence_end_date: null,
      stop_number: stops.length + 1,
      items: ""
    });
  }, [stops.length]);

  const handleAddStop = useCallback(() => {
    console.log("Starting add new stop flow");
    setIsAddingNewStop(true);
    resetForm();
    setCustomerDialogOpen(true);
  }, [resetForm]);

  const handleEditStart = useCallback((index: number) => {
    console.log(`Starting edit for stop at index: ${index}`);
    const stop = stops[index];
    if (!stop) return;

    const customerId = stop.client_id;
    const driverId = stop.driver_id || "";
    
    setEditingIndex(index);
    setEditForm({
      customer: customerId,
      client_id: customerId,
      driver: driverId,
      notes: stop.notes || "",
      is_recurring: stop.is_recurring || false,
      recurrence_frequency: stop.recurrence_frequency || "weekly",
      preferred_day: stop.preferred_day || "monday",
      next_occurrence_date: stop.next_occurrence_date ? new Date(stop.next_occurrence_date) : null,
      recurrence_end_date: stop.recurrence_end_date ? new Date(stop.recurrence_end_date) : null,
      stop_number: stop.stop_number,
      items: stop.items || "",
      recurring_order_id: stop.recurring_order_id
    });
  }, [stops]);

  const handleEditSave = useCallback(() => {
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < stops.length) {
      console.log(`Saving edits for stop at index: ${editingIndex}`, editForm);
      
      const updatedStop: DeliveryStop = {
        ...stops[editingIndex],
        client_id: editForm.customer,
        driver_id: editForm.driver || undefined,
        notes: editForm.notes,
        is_recurring: editForm.is_recurring,
        recurrence_frequency: editForm.recurrence_frequency,
        preferred_day: editForm.preferred_day,
        next_occurrence_date: editForm.next_occurrence_date,
        recurrence_end_date: editForm.recurrence_end_date,
        recurring_order_id: editForm.recurring_order_id,
        stop_number: editForm.stop_number,
        items: editForm.items || ""
      };
      
      const updatedStops = [...stops];
      updatedStops[editingIndex] = updatedStop;
      onStopsChange(updatedStops);
      
      setEditingIndex(null);
      resetForm();
    } else if (isAddingNewStop) {
      console.log("Adding new stop with data:", editForm);
      
      let clientId = editForm.customer;
      let customerId = editForm.customer; // We want client_id to be the customer ID
      
      // Get customer details
      const customer = customers.find((c) => c.id === customerId);
      
      // Create a new stop object
      const newStop: DeliveryStop = {
        stop_number: stops.length + 1,
        client_id: clientId,
        customer: customer,
        driver_id: editForm.driver || undefined,
        items: editForm.items || "",
        notes: editForm.notes,
        status: "PENDING",
        is_recurring: editForm.is_recurring,
        recurrence_frequency: editForm.recurrence_frequency,
        preferred_day: editForm.preferred_day,
        next_occurrence_date: editForm.next_occurrence_date,
        recurrence_end_date: editForm.recurrence_end_date,
        recurring_order_id: editForm.recurring_order_id,
        master_schedule_id: masterScheduleId
      };
      
      onStopsChange([...stops, newStop]);
      
      setIsAddingNewStop(false);
      resetForm();
    }
  }, [editingIndex, editForm, stops, onStopsChange, isAddingNewStop, customers, masterScheduleId, resetForm]);

  const handleEditCancel = useCallback(() => {
    console.log("Cancelling edit/add operation");
    setEditingIndex(null);
    setIsAddingNewStop(false);
    resetForm();
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
  }, [resetForm]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    console.log("Selected customer:", customer);
    setEditForm(prev => ({
      ...prev,
      customer: customer.id,
      client_id: customer.id
    }));
    setCustomerDialogOpen(false);
    setItemsDialogOpen(true);
  }, []);

  const handleItemsSelect = useCallback((items: string) => {
    console.log("Selected items:", items);
    setEditForm(prev => ({
      ...prev,
      items
    }));
    setItemsDialogOpen(false);
    
    // If we're adding a new stop and have both customer and items, save it
    if (isAddingNewStop) {
      handleEditSave();
    }
  }, [isAddingNewStop, handleEditSave]);

  const openCustomerDialog = useCallback(() => {
    setCustomerDialogOpen(true);
  }, []);

  const openItemsDialog = useCallback(() => {
    setItemsDialogOpen(true);
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
    recurrenceData: undefined, // Define this properly if needed
    handleAddStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleCustomerSelect,
    handleItemsSelect,
    openCustomerDialog,
    openItemsDialog,
  };
};
