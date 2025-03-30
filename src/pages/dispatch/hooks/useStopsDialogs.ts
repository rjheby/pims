
import { useState } from 'react';
import { Customer, DeliveryStop, DeliveryStatus, StopFormData, RecurrenceData } from '../components/stops/types';

// Update this type to match how it's used in the StopsTable
type UseStopsDialogsProps = {
  stops?: DeliveryStop[];
  onStopsChange?: (stops: DeliveryStop[]) => void;
  customers?: Customer[];
  drivers?: any[];
  initialItems?: string;
}

export const useStopsDialogs = ({
  stops = [],
  onStopsChange,
  customers = [],
  drivers = [],
  initialItems = ''
}: UseStopsDialogsProps = {}) => {
  // Dialog states
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  
  // Current editing data
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StopFormData>({});
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: false,
    frequency: 'weekly'
  });
  
  const handleAddStop = () => {
    setIsAddingNewStop(true);
    setEditForm({
      status: 'pending',
    });
    setCustomerDialogOpen(true);
  };
  
  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    const stop = stops[index];
    setEditForm({
      ...stop,
    });
  };
  
  const handleEditSave = () => {
    if (editingIndex !== null && onStopsChange) {
      const updatedStops = [...stops];
      updatedStops[editingIndex] = {
        ...updatedStops[editingIndex],
        ...editForm,
      } as DeliveryStop;
      
      onStopsChange(updatedStops);
      setEditingIndex(null);
    } else if (isAddingNewStop && onStopsChange) {
      const newStop: DeliveryStop = {
        id: crypto.randomUUID(),
        stop_number: stops.length + 1,
        ...editForm,
      } as DeliveryStop;
      
      onStopsChange([...stops, newStop]);
      setIsAddingNewStop(false);
    }
    
    setEditForm({});
  };
  
  const handleEditCancel = () => {
    setEditingIndex(null);
    setIsAddingNewStop(false);
    setEditForm({});
    setCustomerDialogOpen(false);
    setItemsDialogOpen(false);
  };
  
  const handleCustomerSelect = (customer: Customer) => {
    setEditForm({
      ...editForm,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_address: customer.address || `${customer.street_address || ''} ${customer.city || ''}, ${customer.state || ''} ${customer.zip_code || ''}`.trim(),
      customer_phone: customer.phone || '',
    });
    setCustomerDialogOpen(false);
    setItemsDialogOpen(true);
  };
  
  const handleItemsSelect = (itemsString: string, price?: number) => {
    setEditForm({
      ...editForm,
      items: itemsString,
      price: price || 0,
    });
    setItemsDialogOpen(false);
    handleEditSave();
  };
  
  const openCustomerDialog = (index?: number) => {
    if (typeof index === 'number') {
      handleEditStart(index);
    }
    setCustomerDialogOpen(true);
  };
  
  const openItemsDialog = (items?: string, price?: number) => {
    if (items) {
      setEditForm({
        ...editForm,
        items,
        price: price || 0,
      });
    }
    setItemsDialogOpen(true);
  };
  
  return {
    // Dialog visibility
    customerDialogOpen,
    itemsDialogOpen,
    isAddingNewStop,
    
    // Form data
    editingIndex,
    editForm,
    recurrenceData,
    
    // Dialog setters
    setCustomerDialogOpen,
    setItemsDialogOpen,
    setEditForm,
    
    // Handlers
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
