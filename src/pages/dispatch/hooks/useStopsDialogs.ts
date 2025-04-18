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
  client_id: { type: 'string' },
  driver_id: { type: 'string', optional: true },
  items: { type: 'string' },
  notes: { type: 'string', optional: true },
  status: { type: 'string', optional: true },
  arrival_time: { type: 'string', optional: true },
  departure_time: { type: 'string', optional: true },
  master_schedule_id: { type: 'string', optional: true },
  recurrence_id: { type: 'string', optional: true },
  itemsData: { type: 'any', optional: true }
};

// Define the schema for a StopFormData
const stopFormDataSchema = {
  client_id: { type: 'string' },
  items: { type: 'string' },
  notes: { type: 'string', optional: true },
  status: { type: 'string', optional: true },
  driver_id: { type: 'string', optional: true },
  stop_number: { type: 'number', optional: true },
  master_schedule_id: { type: 'string', optional: true },
  recurrence_id: { type: 'string', optional: true },
  itemsData: { type: 'any', optional: true }
};

// Update this type to match how it's used in the StopsTable
type UseStopsDialogsProps = {
  stops?: DeliveryStop[];
  onStopsChange?: (stops: DeliveryStop[]) => void;
  customers?: Customer[];
  drivers?: any[];
  initialItems?: string;
  masterScheduleId?: string;
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
  initialItems = '',
  masterScheduleId
}: UseStopsDialogsProps = {}): UseStopsDialogsReturn => {
  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  
  // Current editing data
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StopFormData>({
    client_id: '',
    items: initialItems || ''
  });
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: false,
    frequency: 'weekly'
  });
  
  const handleAddStop = useCallback(() => {
    setIsAddingNewStop(true);
    setEditForm({
      client_id: '',
      items: initialItems || '',
      status: 'PENDING',
      master_schedule_id: masterScheduleId
    });
    setCustomerDialogOpen(true);
  }, [initialItems, masterScheduleId]);

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
      client_id: stop.client_id,
      items: stop.items,
      notes: stop.notes,
      status: stop.status,
      driver_id: stop.driver_id,
      stop_number: stop.stop_number
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
    
    // Check for required fields
    if (!editForm.client_id) {
      console.error('Missing required field: client_id');
      return;
    }
    
    if (!editForm.items) {
      console.error('Missing required field: items');
      return;
    }
    
    const newStops = [...stops];
    
    if (isAddingNewStop) {
      // Add a new stop
      const newStop: DeliveryStop = {
        stop_number: stops.length + 1,
        client_id: editForm.client_id,
        items: editForm.items,
        notes: editForm.notes,
        status: editForm.status || 'PENDING',
        driver_id: editForm.driver_id,
        master_schedule_id: masterScheduleId,
        itemsData: editForm.itemsData
      };
      
      // Find the customer object
      const customer = customers.find(c => c.id === editForm.client_id);
      if (customer) {
        newStop.customer = customer;
      }
      
      // Find the driver object if driver_id is provided
      if (editForm.driver_id) {
        const driver = drivers.find(d => d.id === editForm.driver_id);
        if (driver) {
          newStop.driver = driver;
        }
      }
      
      // Validate the new stop before adding it
      const stopValidation = validateAgainstSchema(newStop, deliveryStopSchema);
      if (!stopValidation.isValid) {
        console.error('Invalid stop data:', stopValidation.errors);
        // Continue with the data we have, but log the errors
      }
      
      newStops.push(newStop);
    } else if (editingIndex !== null) {
      // Update an existing stop
      const updatedStop = {
        ...newStops[editingIndex],
        client_id: editForm.client_id,
        items: editForm.items,
        notes: editForm.notes,
        status: editForm.status,
        driver_id: editForm.driver_id,
        itemsData: editForm.itemsData
      };
      
      // Find the customer object
      const customer = customers.find(c => c.id === editForm.client_id);
      if (customer) {
        updatedStop.customer = customer;
      }
      
      // Find the driver object if driver_id is provided
      if (editForm.driver_id) {
        const driver = drivers.find(d => d.id === editForm.driver_id);
        if (driver) {
          updatedStop.driver = driver;
        }
      }
      
      newStops[editingIndex] = updatedStop;
    }
    
    onStopsChange(newStops);
    handleEditCancel();
  }, [stops, onStopsChange, editForm, isAddingNewStop, editingIndex, customers, drivers, masterScheduleId]);

  const handleEditCancel = useCallback(() => {
    setEditingIndex(null);
    setIsAddingNewStop(false);
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
    setEditForm({
      client_id: '',
      items: initialItems || '',
      master_schedule_id: masterScheduleId
    });
  }, [initialItems, masterScheduleId]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setEditForm(prev => ({
      ...prev,
      client_id: customer.id,
      master_schedule_id: masterScheduleId
    }));
    setCustomerDialogOpen(false);
    setItemsDialogOpen(true);
  }, [masterScheduleId]);

  const handleItemsSelect = useCallback((items: string) => {
    setEditForm(prev => ({
      ...prev,
      items,
      master_schedule_id: masterScheduleId
    }));
    setItemsDialogOpen(false);
    setEditDialogOpen(true);
  }, [masterScheduleId]);

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
