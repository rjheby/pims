
import { useState, useEffect } from "react";
import { Customer, DeliveryStop, StopFormData } from "../components/stops/types";
import { RecurrenceData } from "../components/stops/RecurringOrderForm";
import { calculatePrice } from "../components/stops/utils";
import { useToast } from "@/hooks/use-toast";

export const useStopsDialogs = (
  stops: DeliveryStop[],
  onStopsChange: (stops: DeliveryStop[]) => void,
  customers: Customer[],
  drivers: any[]
) => {
  const toast = useToast();
  
  console.log("useStopsDialogs initialized with:", { 
    stopsCount: stops?.length || 0, 
    customersCount: customers?.length || 0, 
    driversCount: drivers?.length || 0 
  });
  
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer_id: null,
    notes: null,
    driver_id: null,
    items: null,
    stop_number: undefined,
    itemsData: [] // Initialize with empty array
  });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({ 
    isRecurring: false, 
    frequency: 'none'
  });

  useEffect(() => {
    // When component mounts, validate that all stops have itemsData as an array
    if (Array.isArray(stops)) {
      validateAndFixStops();
    }
  }, [stops]);

  const handleAddStop = () => {
    console.log("handleAddStop called, current state:", { 
      isAddingNewStop, 
      editingIndex,
      stopsCount: stops?.length || 0
    });
    
    if (isAddingNewStop) {
      console.log("Already adding a stop, please complete or cancel first");
      return;
    }
    
    try {
      const stopsArray = Array.isArray(stops) ? stops : [];
      const stopNumber = stopsArray.length + 1;
      console.log("Creating new stop with stop_number:", stopNumber);
      
      const newStop: DeliveryStop = {
        customer_id: null,
        notes: null,
        driver_id: null,
        items: null,
        itemsData: [], // Initialize with empty array
        price: 0,
        stop_number: stopNumber,
        sequence: stopNumber
      };
      
      const newStops = [...stopsArray, newStop];
      console.log("Adding new stop to stops array, new length:", newStops.length);
      onStopsChange(newStops);
      
      setEditingIndex(newStops.length - 1);
      setEditForm({
        customer_id: null,
        notes: null,
        driver_id: null,
        items: null,
        itemsData: [], // Initialize with empty array
        stop_number: stopNumber
      });
      
      setIsAddingNewStop(true);
      
      console.log("Opening customer dialog for new stop");
      setCustomerDialogOpen(true);
    } catch (error) {
      console.error("Error adding new stop:", error);
      toast.toast({
        title: "Error",
        description: "Failed to add new stop",
        variant: "destructive"
      });
      resetEditState();
    }
  };

  const handleEditStart = (index: number) => {
    console.log("handleEditStart called with index:", index);
    
    if (isAddingNewStop) {
      console.log("Cannot edit while adding a new stop");
      return;
    }
    
    if (!Array.isArray(stops) || index < 0 || index >= stops.length) {
      console.error("Invalid stops array or index:", { stops, index });
      return;
    }
    
    setEditingIndex(index);
    const stopToEdit = stops[index];
    console.log("Stop to edit:", stopToEdit);
    
    // Ensure itemsData is always an array
    const itemsDataArray = Array.isArray(stopToEdit.itemsData) ? 
      stopToEdit.itemsData : 
      [];

    console.log("itemsData for this stop:", itemsDataArray);
    
    setEditForm({
      customer_id: stopToEdit.customer_id || null,
      notes: stopToEdit.notes || null,
      driver_id: stopToEdit.driver_id || null,
      items: stopToEdit.items || null,
      stop_number: stopToEdit.stop_number || index + 1,
      itemsData: itemsDataArray // Ensure we're using the array version
    });
    
    if (stopToEdit.recurring) {
      console.log("Stop has recurring data:", stopToEdit.recurring);
      setRecurrenceData({
        isRecurring: stopToEdit.recurring.isRecurring,
        frequency: stopToEdit.recurring.frequency,
        preferredDay: stopToEdit.recurring.preferredDay,
        startDate: stopToEdit.recurring.startDate,
        endDate: stopToEdit.recurring.endDate
      });
    } else {
      console.log("Stop does not have recurring data, setting defaults");
      setRecurrenceData({
        isRecurring: false,
        frequency: 'none'
      });
    }
    
    // Show a toast to confirm edit mode
    toast.toast({
      title: "Editing Stop",
      description: `Editing stop #${stopToEdit.stop_number || index + 1}`
    });
  };

  const handleEditSave = () => {
    console.log("handleEditSave called, editingIndex:", editingIndex);
    
    if (!Array.isArray(stops)) {
      console.error("Stops is not an array", stops);
      return;
    }
    
    if (editingIndex < 0 || editingIndex >= stops.length) {
      console.error("Invalid editing index:", editingIndex);
      return;
    }
    
    // Log the current form data
    console.log("Saving stop with form data:", editForm);
    console.log("Items data:", editForm.itemsData); // This should NOT be undefined
    
    // Ensure itemsData is an array before processing
    const itemsArray = Array.isArray(editForm.itemsData) ? editForm.itemsData : [];
    console.log("Items array after validation:", itemsArray);
    
    let price = 0;
    if (itemsArray.length > 0) {
      price = itemsArray.reduce((total, item) => {
        // Ensure item.price and item.quantity are converted to numbers properly
        const itemPrice = typeof item.price === 'number' ? item.price : 
                         typeof item.price === 'string' ? parseFloat(item.price) : 0;
        
        const quantity = typeof item.quantity === 'number' ? item.quantity : 
                        typeof item.quantity === 'string' ? parseInt(item.quantity) : 1;
        
        const itemTotal = itemPrice * quantity;
        console.log(`Item price calculation: ${quantity} x $${itemPrice} = $${itemTotal}`);
        return total + itemTotal;
      }, 0);
    } else if (editForm.items) {
      console.log("No itemsData, falling back to calculating price from items string");
      price = calculatePrice(editForm.items);
    }
    
    console.log("Calculated price:", price);
    
    const selectedCustomer = customers?.find(c => c.id === editForm.customer_id);
    const selectedDriver = drivers?.find(d => d.id === editForm.driver_id);
    
    console.log("Selected customer:", selectedCustomer?.name, "id:", editForm.customer_id);
    console.log("Selected driver:", selectedDriver?.name, "id:", editForm.driver_id);
    
    // THIS IS CRITICAL - we must include both items and itemsData in the updatedStop
    const updatedStop = {
      ...stops[editingIndex],
      ...editForm,
      price,
      items: editForm.items, // Ensure items string is included
      itemsData: itemsArray, // ENSURE itemsData array is included
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
    
    console.log("Updated stop data:", JSON.stringify(updatedStop));
    console.log("Does updatedStop have itemsData?", !!updatedStop.itemsData);
    
    const newStops = [...stops];
    newStops[editingIndex] = updatedStop;
    
    console.log("Saving stops with new data");
    onStopsChange(newStops);

    // Show a confirmation toast
    toast.toast({
      title: "Stop Saved",
      description: `Stop #${updatedStop.stop_number} has been updated`
    });
    
    resetEditState();
  };

  const resetEditState = () => {
    console.log("Resetting edit state");
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
    console.log("Cancelling stop edit/add operation, isAddingNewStop:", isAddingNewStop);
    if (isAddingNewStop && Array.isArray(stops)) {
      const newStops = [...stops];
      newStops.pop();
      console.log("Removing last stop, new stops length:", newStops.length);
      onStopsChange(newStops);
    }
    
    resetEditState();
  };

  const handleCustomerSelect = (customer: Customer) => {
    console.log("Customer select handler called with customer:", customer?.name, customer?.id);
    
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
  
  const handleItemsSelect = (items: string, itemsData?: any[], recurrenceInfo?: RecurrenceData) => {
    console.log("Selected items:", items);
    console.log("Items data received:", itemsData); // Should be an array
    
    // Ensure itemsData is an array before setting it in the form
    const validItemsData = Array.isArray(itemsData) ? itemsData : [];
    console.log("Valid items data array:", validItemsData);
    
    // CRITICAL: Make sure we're setting itemsData in the form
    setEditForm(prev => {
      const newForm = {
        ...prev,
        items,
        itemsData: validItemsData
      };
      console.log("Updated form with itemsData:", JSON.stringify(newForm));
      return newForm;
    });
    
    if (recurrenceInfo) {
      console.log("Received recurrence info:", recurrenceInfo);
      setRecurrenceData(recurrenceInfo);
    }
    
    setItemsDialogOpen(false);
    
    if (isAddingNewStop) {
      console.log("Will save stop after items selection");
      // Use a slight delay to ensure form state is updated
      setTimeout(() => {
        console.log("Saving stop now - itemsData should be present");
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

  // Add this helper function to make sure stops always have itemsData as an array
  const ensureStopsHaveItemsData = (stopsArray: DeliveryStop[]): DeliveryStop[] => {
    return stopsArray.map(stop => {
      if (!Array.isArray(stop.itemsData)) {
        console.log(`Fixing stop #${stop.stop_number}: itemsData wasn't an array`);
        return {
          ...stop,
          itemsData: []
        };
      }
      return stop;
    });
  };

  // Call this function whenever stops change
  const validateAndFixStops = () => {
    if (Array.isArray(stops)) {
      const fixedStops = ensureStopsHaveItemsData(stops);
      if (JSON.stringify(fixedStops) !== JSON.stringify(stops)) {
        console.log("Fixed stops with missing itemsData arrays");
        onStopsChange(fixedStops);
      }
    }
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
