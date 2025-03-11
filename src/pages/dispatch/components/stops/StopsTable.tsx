
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { MapPinPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StopsDesktopTable } from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { CustomerSelector } from "./CustomerSelector";
import { ItemSelector } from "./ItemSelector";
import { Driver, DeliveryStop, StopFormData, Customer } from "./types";
import { calculatePrice } from "./utils";

interface StopsTableProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  useMobileLayout?: boolean;
  readOnly?: boolean;
  masterScheduleId?: string;
}

const StopsTable = ({ 
  stops, 
  onStopsChange, 
  useMobileLayout = false,
  readOnly = false,
  masterScheduleId
}: StopsTableProps) => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer_id: null,
    notes: null,
    driver_id: null,
    items: null,
  });
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("stop_number");
  const [filterByDriver, setFilterByDriver] = useState<string | null>(null);
  
  const [isAddingNewStop, setIsAddingNewStop] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes')
        .order('created_at', { ascending: false });

      if (customersError) {
        throw new Error(`Error fetching customers: ${customersError.message}`);
      }

      const customersWithType = customersData.map((customer) => ({
        ...customer,
        type: 'RETAIL'
      }));

      setCustomers(customersWithType);

      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (driversError) {
        throw new Error(`Error fetching drivers: ${driversError.message}`);
      }

      setDrivers(driversData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddStop = () => {
    // Validate before proceeding
    if (isAddingNewStop) {
      console.log("Already adding a stop, please complete or cancel first");
      return;
    }
    
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
    setCustomerDialogOpen(true);
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
  };

  const handleEditCancel = () => {
    if (isAddingNewStop) {
      const newStops = [...stops];
      newStops.pop();
      onStopsChange(newStops);
    }
    
    resetEditState();
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    onStopsChange(newStops);

    updateStopNumbers(newStops);
  };

  const updateStopNumbers = (updatedStops: any[]) => {
    const stopsWithNumbers = updatedStops.map((stop, index) => ({
      ...stop,
      stop_number: index + 1,
    }));
    onStopsChange(stopsWithNumbers);
  };

  const handleSelectStop = (stopId: string, index: number, event?: React.MouseEvent) => {
    if (!event) return;
    
    const mouseEvent = event as unknown as React.MouseEvent;

    if (mouseEvent.shiftKey) {
      if (selectedStops.includes(stopId)) {
        setSelectedStops(selectedStops.filter((id) => id !== stopId));
      } else {
        setSelectedStops([...selectedStops, stopId]);
      }
    } else {
      if (selectedStops.includes(stopId)) {
        setSelectedStops([]);
      } else {
        setSelectedStops([stopId]);
      }
    }
  };

  const handleDuplicateStop = (index: number) => {
    const stopToDuplicate = { ...stops[index] };
    delete stopToDuplicate.id;
    
    const newStops = [...stops, stopToDuplicate];
    onStopsChange(newStops);
    
    updateStopNumbers(newStops);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const reorderedStops = [...stops];
    const [removed] = reorderedStops.splice(sourceIndex, 1);
    reorderedStops.splice(destinationIndex, 0, removed);
    
    const updatedStops = reorderedStops.map((stop, index) => ({
      ...stop,
      stop_number: index + 1,
    }));
    
    onStopsChange(updatedStops);
  };

  const sortedAndFilteredStops = [...stops]
    .filter(stop => {
      if (!filterByDriver) return true;
      return stop.driver_id === filterByDriver;
    })
    .sort((a, b) => {
      if (sortBy === "stop_number") {
        return (a.stop_number || 0) - (b.stop_number || 0);
      } else if (sortBy === "customer") {
        const customerA = customers.find(c => c.id === a.customer_id)?.name || "";
        const customerB = customers.find(c => c.id === b.customer_id)?.name || "";
        return customerA.localeCompare(customerB);
      } else if (sortBy === "driver") {
        const driverA = drivers.find(d => d.id === a.driver_id)?.name || "";
        const driverB = drivers.find(d => d.id === b.driver_id)?.name || "";
        return driverA.localeCompare(driverB);
      }
      return 0;
    });

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleDriverFilterChange = (value: string | null) => {
    setFilterByDriver(value);
  };
  
  const handleCustomerSelect = (customer: Customer) => {
    setEditForm(prev => ({
      ...prev,
      customer_id: customer.id
    }));
    
    setCustomerDialogOpen(false);
    
    if (isAddingNewStop) {
      setTimeout(() => {
        setItemsDialogOpen(true);
      }, 250);
    }
  };
  
  const handleItemsSelect = (items: string) => {
    console.log("Selected items:", items);
    setEditForm(prev => ({
      ...prev,
      items
    }));
    
    setItemsDialogOpen(false);
    
    if (isAddingNewStop) {
      setTimeout(() => {
        handleEditSave();
      }, 250);
    }
  };

  const openCustomerDialog = () => {
    setCustomerDialogOpen(true);
  };

  const openItemsDialog = () => {
    setItemsDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-lg font-medium">Delivery Stops</h3>
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <Button 
              variant="customAction" 
              onClick={handleAddStop}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
            >
              <MapPinPlus className="mr-2 h-4 w-4" />
              Add Stop
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Sort by:</span>
          <select 
            className="text-sm border rounded p-2 bg-white"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="stop_number">Stop Number</option>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Filter by driver:</span>
          <select 
            className="text-sm border rounded p-2 bg-white"
            value={filterByDriver || ""}
            onChange={(e) => handleDriverFilterChange(e.target.value || null)}
          >
            <option value="">All Drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <Dialog 
        open={customerDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleEditCancel();
          } else {
            setCustomerDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Select Customer</DialogTitle>
          <DialogDescription>Choose a customer for this stop</DialogDescription>
          <CustomerSelector 
            onSelect={handleCustomerSelect}
            onCancel={handleEditCancel}
            initialCustomerId={editForm.customer_id}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={itemsDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleEditCancel();
          } else {
            setItemsDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Select Items</DialogTitle>
          <DialogDescription>Add items for this delivery</DialogDescription>
          <ItemSelector 
            onSelect={handleItemsSelect}
            onCancel={handleEditCancel}
            initialItems={editForm.items}
          />
        </DialogContent>
      </Dialog>
      
      {stops.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {useMobileLayout ? (
                  <StopsMobileCards
                    stops={sortedAndFilteredStops}
                    customers={customers}
                    drivers={drivers}
                    editingIndex={editingIndex}
                    editForm={editForm}
                    onEditFormChange={setEditForm}
                    onEditStart={handleEditStart}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                    onRemoveStop={handleRemoveStop}
                    readOnly={readOnly}
                    selectedStops={selectedStops}
                    onSelectStop={handleSelectStop}
                    onDuplicateStop={handleDuplicateStop}
                    onOpenCustomerDialog={openCustomerDialog}
                    onOpenItemsDialog={openItemsDialog}
                  />
                ) : (
                  <StopsDesktopTable
                    stops={sortedAndFilteredStops}
                    customers={customers}
                    drivers={drivers}
                    editingIndex={editingIndex}
                    editForm={editForm}
                    onEditFormChange={setEditForm}
                    onEditStart={handleEditStart}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                    onRemoveStop={handleRemoveStop}
                    readOnly={readOnly}
                    selectedStops={selectedStops}
                    onSelectStop={handleSelectStop}
                    onDuplicateStop={handleDuplicateStop}
                    draggable={!readOnly}
                    onOpenCustomerDialog={openCustomerDialog}
                    onOpenItemsDialog={openItemsDialog}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-dashed rounded-lg">
          <p className="text-gray-500">No delivery stops added yet.</p>
          {!readOnly && (
            <Button 
              variant="customAction"
              onClick={handleAddStop}
              className="mt-4 bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
            >
              <MapPinPlus className="mr-2 h-4 w-4" />
              Add First Stop
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StopsTable;
