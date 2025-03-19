
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { MapPinPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StopsDesktopTable from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { StopDialogs } from "./StopDialogs";
import { Driver, DeliveryStop, StopFormData, Customer } from "./types";
import { useStopsDialogs } from "../../hooks/useStopsDialogs";
import ErrorBoundary from "./ErrorBoundary";

interface StopsTableProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  useMobileLayout?: boolean;
  readOnly?: boolean;
  masterScheduleId?: string;
  customers?: Customer[];
  drivers?: Driver[];
}

const StopsTable = ({ 
  stops, 
  onStopsChange, 
  useMobileLayout = false,
  readOnly = false,
  masterScheduleId,
  customers = [],
  drivers = []
}: StopsTableProps) => {
  console.log("StopsTable rendering with props:", { 
    stopsCount: stops.length, 
    useMobileLayout, 
    readOnly, 
    masterScheduleId 
  });
  
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("stop_number");
  const [filterByDriver, setFilterByDriver] = useState<string | null>(null);
  
  const {
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
  } = useStopsDialogs(stops, onStopsChange, customers, drivers);

  console.log("Current dialog states:", { 
    customerDialogOpen, 
    itemsDialogOpen, 
    editingIndex,
    isAddingNewStop
  });

  const fetchData = useCallback(async () => {
    console.log("Fetching data (customers and drivers)");
    setLoading(true);
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, street_address, city, state, zip_code')
        .order('created_at', { ascending: false });

      if (customersError) {
        throw new Error(`Error fetching customers: ${customersError.message}`);
      }

      console.log(`Fetched ${customersData?.length || 0} customers`);
      
      // Make sure all customers have valid IDs
      const validCustomers = customersData.filter(customer => customer.id);
      console.log(`${validCustomers.length} customers have valid IDs`);
      
      const customersWithType = validCustomers.map((customer) => ({
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

      console.log(`Fetched ${driversData?.length || 0} drivers`);
      
      // Make sure all drivers have valid IDs
      const validDrivers = driversData ? driversData.filter(driver => driver.id) : [];
      console.log(`${validDrivers.length} drivers have valid IDs`);
      
      setDrivers(validDrivers);
    } catch (error: any) {
      console.error("Error in fetchData:", error);
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
    console.log("Running fetchData effect");
    fetchData();
  }, [fetchData]);

  const handleRemoveStop = (index: number) => {
    console.log("Removing stop at index:", index);
    const newStops = [...stops];
    newStops.splice(index, 1);
    onStopsChange(newStops);

    updateStopNumbers(newStops);
  };

  const updateStopNumbers = (updatedStops: any[]) => {
    console.log("Updating stop numbers for", updatedStops.length, "stops");
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
    console.log("Duplicating stop at index:", index);
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
    
    console.log(`Moving stop from index ${sourceIndex} to index ${destinationIndex}`);
    
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

  const handleAddStopClick = () => {
    console.log("Add Stop button clicked");
    handleAddStop();
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h3 className="text-lg font-medium">Delivery Stops</h3>
          <div className="flex items-center space-x-2">
            {!readOnly && (
              <Button 
                variant="customAction" 
                onClick={handleAddStopClick}
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
        
        <div>
          <pre className="hidden">{JSON.stringify({ customerDialogOpen, itemsDialogOpen }, null, 2)}</pre>
        </div>
        
        <StopDialogs
          customerDialogOpen={customerDialogOpen}
          setCustomerDialogOpen={setCustomerDialogOpen}
          itemsDialogOpen={itemsDialogOpen}
          setItemsDialogOpen={setItemsDialogOpen}
          onCustomerSelect={handleCustomerSelect}
          onItemsSelect={handleItemsSelect}
          onCancel={handleEditCancel}
          initialCustomerId={editForm.customer_id}
          initialItems={editForm.items}
          recurrenceData={recurrenceData}
          customers={customers}
        />
        
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
                      onStopsChange={onStopsChange}
                      useMobileLayout={useMobileLayout}
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
                onClick={handleAddStopClick}
                className="mt-4 bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
              >
                <MapPinPlus className="mr-2 h-4 w-4" />
                Add First Stop
              </Button>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default StopsTable;
