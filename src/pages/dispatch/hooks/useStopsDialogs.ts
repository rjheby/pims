import { useState } from "react";
import { Customer, DeliveryStop, StopFormData } from "../components/stops/types";
import { RecurrenceData } from "../components/stops/RecurringOrderForm";
import { calculatePrice } from "../components/stops/utils";

export const useStopsDialogs = (
  stops: DeliveryStop[],
  onStopsChange: (stops: DeliveryStop[]) => void,
  customers: Customer[],
  drivers: any[]
) => {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer_id: null,
    notes: null,
    driver_id: null,
    items: null,
  });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({ 
    isRecurring: false, 
    frequency: 'none'
  });

  const handleAddStop = () => {
    if (isAddingNewStop) {
      console.log("Already adding a stop, please complete or cancel first");
      return;
    }
    
    try {
      const stopNumber = stops.length + 1;
      const newStop: DeliveryStop = {
        customer_id: null,
        notes: null,
        driver_id: null,
        items: null,
        price: 0,
        stop_number: stopNumber,
        sequence: stopNumber
      };
      
      const newStops = [...stops, newStop];
      onStopsChange(newStops);
      
      setEditingIndex(newStops.length - 1);
      setEditForm({
        customer_id: null,
        notes: null,
        driver_id: null,
        items: null,
        stop_number: stopNumber
      });
      
      setIsAddingNewStop(true);
      
      console.log("Opening customer dialog for new stop");
      setCustomerDialogOpen(true);
    } catch (error) {
      console.error("Error adding new stop:", error);
      resetEditState();
    }
  };

  const handleEditStart = (index: number) => {
    if (isAddingNewStop) {
      console.log("Cannot edit while adding a new stop");
      return;
    }
    
    setEditingIndex(index);
    const stopToEdit = stops[index];
    setEditForm({
      customer_id: stopToEdit.customer_id || null,
      notes: stopToEdit.notes || null,
      driver_id: stopToEdit.driver_id || null,
      items: stopToEdit.items || null,
      stop_number: stopToEdit.stop_number || index + 1,
    });
    
    if (stopToEdit.recurring) {
      setRecurrenceData({
        isRecurring: stopToEdit.recurring.isRecurring,
        frequency: stopToEdit.recurring.frequency,
        preferredDay: stopToEdit.recurring.preferredDay,
        startDate: stopToEdit.recurring.startDate,
        endDate: stopToEdit.recurring.endDate
      });
    } else {
      setRecurrenceData({
        isRecurring: false,
        frequency: 'none'
      });
    }
  };

  const handleEditSave = () => {
    if (editingIndex < 0 || editingIndex >= stops.length) {
      console.error("Invalid editing index:", editingIndex);
      return;
    }
    
    console.log("Saving stop with form data:", editForm);
    const price = calculatePrice(editForm.items);
    
    const selectedCustomer = customers.find(c => c.id === editForm.customer_id);
    const selectedDriver = drivers.find(d => d.id === editForm.driver_id);
    
    const updatedStop = {
      ...stops[editingIndex],
      ...editForm,
      price,
      customer_name: selectedCustomer?.name,
      customer_address: selectedCustomer?.address,
      customer_phone: selectedCustomer?.phone,
      driver_name: selectedDriver?.name,
      recurring: recurrenceData.isRecurring ? {
        isRecurring: recurrenceData.isRecurring,
        frequency: recurrenceData.frequency,
        preferredDay: recurrenceData.preferredDay,
        startDate: recurrenceData.startDate,
        endDate: recurrenceData.endDate
      } : undefined
    };
    
    console.log("Updated stop data:", updatedStop);
    
    const newStops = [...stops];
    newStops[editingIndex] = updatedStop;
    
    onStopsChange(newStops);
    resetEditState();
  };

  const resetEditState = () => {
    setEditingIndex(-1);
    setIsAddingNewStop(false);
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
    setRecurrenceData({
      isRecurring: false,
      frequency: 'none'
    });
  };

  const handleEditCancel = () => {
    console.log("Cancelling stop edit/add operation");
    if (isAddingNewStop) {
      const newStops = [...stops];
      newStops.pop();
      onStopsChange(newStops);
    }
    
    resetEditState();
  };

  const handleCustomerSelect = (customer: Customer) => {
    if (!customer || !customer.id) {
      console.error("Invalid customer selected");
      return;
    }
    
    console.log("Customer selected:", customer.name, customer.id);
    setEditForm(prev => ({
      ...prev,
      customer_id: customer.id
    }));
    
    setCustomerDialogOpen(false);
    
    if (isAddingNewStop) {
      console.log("Will open items dialog after customer selection");
      setTimeout(() => {
        console.log("Opening items dialog now");
        setItemsDialogOpen(true);
      }, 300);
    }
  };
  
  const handleItemsSelect = (items: string, recurrenceInfo?: RecurrenceData) => {
    console.log("Selected items:", items);
    setEditForm(prev => ({
      ...prev,
      items
    }));
    
    if (recurrenceInfo) {
      setRecurrenceData(recurrenceInfo);
    }
    
    setItemsDialogOpen(false);
    
    if (isAddingNewStop) {
      console.log("Will save stop after items selection");
      setTimeout(() => {
        console.log("Saving stop now");
        handleEditSave();
      }, 300);
    }
  };

  const openCustomerDialog = () => {
    console.log("Explicitly opening customer dialog");
    setCustomerDialogOpen(true);
  };

  const openItemsDialog = () => {
    console.log("Explicitly opening items dialog");
    setItemsDialogOpen(true);
  };

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
    setRecurrenceData,
    handleAddStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleCustomerSelect,
    handleItemsSelect,
    openCustomerDialog,
    openItemsDialog,
    resetEditState
  };
};
