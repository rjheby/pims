import { useState, useCallback } from 'react';
import { 
  Customer, 
  DeliveryStop, 
  StopFormData, 
  RecurrenceData, 
  UseStopsDialogsReturn 
} from '../components/stops/types';
import { validateAgainstSchema } from '@/utils/schemaValidation';

// Define the schema for a DeliveryStop
const deliveryStopSchema = {
  id: { type: 'string', optional: true },
  stop_number: { type: 'number' },
  customer_id: { type: 'string' },
  driver_id: { type: 'string', optional: true },
  items: { type: 'string' },
  notes: { type: 'string', optional: true },
  status: { type: 'string', optional: true },
  arrival_time: { type: 'string', optional: true },
  departure_time: { type: 'string', optional: true },
  master_schedule_id: { type: 'string', optional: true },
  recurrence_id: { type: 'string', optional: true }
};

// Define the schema for a StopFormData
const stopFormDataSchema = {
  customer_id: { type: 'string' },
  items: { type: 'string' },
  notes: { type: 'string', optional: true },
  status: { type: 'string', optional: true },
  driver_id: { type: 'string', optional: true }
};

// Update this type to match how it's used in the StopsTable
type UseStopsDialogsProps = {
  stops?: DeliveryStop[];
  onStopsChange?: (stops: DeliveryStop[]) => void;
  customers?: Customer[];
  drivers?: any[];
  initialItems?: string;
}

// Define delivery status options
export const DELIVERY_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export const useStopsDialogs = ({
  stops = [],
  onStopsChange,
  customers = [],
  drivers = [],
  initialItems = ''
}: UseStopsDialogsProps = {}): UseStopsDialogsReturn => {
  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  
  // Current editing data
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer_id: '',
    items: initialItems || ''
  });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: false,
    frequency: 'weekly'
  });
  
  const handleAddStop = useCallback(() => {
    setIsAddingNewStop(true);
    setEditForm({
      customer_id: '',
      items: initialItems || '',
      status: 'PENDING'
    });
    setCustomerDialogOpen(true);
  }, [initialItems]);

  const handleEditStart = useCallback((index: number) => {
    const stop = stops[index];
    if (!stop) return;
    
    // Validate the stop against the schema
    const validation = validateAgainstSchema(stop, deliveryStopSchema);
    if (!validation.isValid) {
      console.error('Invalid stop data:', validation.errors);
      // Continue with the data we have, but log the errors
    }
    
    setEditingIndex(index);
    setEditForm({
      customer_id: stop.customer_id,
      items: stop.items,
      notes: stop.notes,
      status: stop.status,
      driver_id: stop.driver_id
    });
    setCustomerDialogOpen(true);
  }, [stops]);

  const handleEditSave = useCallback(() => {
    if (!onStopsChange) return;
    
    // Validate the form data against the schema
    const validation = validateAgainstSchema(editForm, stopFormDataSchema);
    if (!validation.isValid) {
      console.error('Invalid form data:', validation.errors);
      // Continue with the data we have, but log the errors
    }
    
    const newStops = [...stops];
    
    if (isAddingNewStop) {
      // Add a new stop
      const newStop: DeliveryStop = {
        stop_number: stops.length + 1,
        customer_id: editForm.customer_id,
        items: editForm.items,
        notes: editForm.notes,
        status: editForm.status || 'PENDING',
        driver_id: editForm.driver_id
      };
      
      // Find the customer object
      const customer = customers.find(c => c.id === editForm.customer_id);
      if (customer) {
        newStop.customer = customer;
      }
      
      newStops.push(newStop);
    } else if (editingIndex !== null) {
      // Update an existing stop
      const updatedStop = {
        ...newStops[editingIndex],
        customer_id: editForm.customer_id,
        items: editForm.items,
        notes: editForm.notes,
        status: editForm.status,
        driver_id: editForm.driver_id
      };
      
      // Find the customer object
      const customer = customers.find(c => c.id === editForm.customer_id);
      if (customer) {
        updatedStop.customer = customer;
      }
      
      newStops[editingIndex] = updatedStop;
    }
    
    onStopsChange(newStops);
    handleEditCancel();
  }, [stops, onStopsChange, editForm, isAddingNewStop, editingIndex, customers]);

  const handleEditCancel = useCallback(() => {
    setEditingIndex(null);
    setIsAddingNewStop(false);
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
    setEditForm({
      customer_id: '',
      items: initialItems || ''
    });
  }, [initialItems]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setEditForm(prev => ({
      ...prev,
      customer_id: customer.id
    }));
    setCustomerDialogOpen(false);
    setItemsDialogOpen(true);
  }, []);

  const handleItemsSelect = useCallback((items: string) => {
    setEditForm(prev => ({
      ...prev,
      items
    }));
    setItemsDialogOpen(false);
    
    // If we're editing, save the changes
    if (editingIndex !== null || isAddingNewStop) {
      handleEditSave();
    }
  }, [editingIndex, isAddingNewStop, handleEditSave]);

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
    recurrenceData,
    handleAddStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleCustomerSelect,
    handleItemsSelect,
    openCustomerDialog,
    openItemsDialog
  };
};
