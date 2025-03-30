
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

// Define missing delivery status options to fix build errors
export const DELIVERY_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'en_route', label: 'En Route' },
  { value: 'arrived', label: 'Arrived' },
  { value: 'completed', label: 'Completed' },
  { value: 'issue', label: 'Issue' },
  { value: 'cancelled', label: 'Cancelled' }
];

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
  
  // Function to manually add a stop for testing/logging purposes
  const addManualStop = (customerId: string, customerName: string, customerAddress: string, customerPhone: string, items: string) => {
    console.log("Manually adding stop with following details:");
    console.log(`- Customer ID: ${customerId}`);
    console.log(`- Customer Name: ${customerName}`);
    console.log(`- Items: ${items}`);
    
    if (onStopsChange) {
      const newStop: DeliveryStop = {
        id: crypto.randomUUID(),
        stop_number: stops.length + 1,
        customer_id: customerId,
        customer_name: customerName,
        customer_address: customerAddress,
        customer_phone: customerPhone,
        items: items,
        price: calculateItemsPrice(items),
        status: 'pending'
      } as DeliveryStop;
      
      console.log("Created new stop:", newStop);
      onStopsChange([...stops, newStop]);
      console.log(`Stop added to schedule, new total: ${stops.length + 1} stops`);
      return true;
    }
    
    console.log("Failed to add stop: onStopsChange callback not provided");
    return false;
  };
  
  // Helper function to calculate price based on items (simplified)
  const calculateItemsPrice = (items: string): number => {
    if (!items) return 0;
    
    // Simple logic to calculate price based on items
    // For "pizza wood" specifically price it at $45 per bundle
    if (items.toLowerCase().includes("pizza wood")) {
      return 45;
    }
    
    // Default calculation for other items
    const itemsList = items.split(',').map(item => item.trim());
    return itemsList.length * 10;
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
      price: price || calculateItemsPrice(itemsString),
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
    addManualStop, // Expose our manual add function for testing/logging
  };
};
