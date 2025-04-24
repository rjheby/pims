
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { MapPinPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import StopsDesktopTable from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { StopDialogs } from "./StopDialogs";
import { Driver, DeliveryStop, StopFormData, Customer, StopsTableProps } from "./types";
import { RecurrenceData } from "@/types/recurring";
import { useStopsDialogs } from "../../hooks/useStopsDialogs";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateAgainstSchema } from "@/utils/schemaValidation";

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
  recurrence_id: { type: 'string', optional: true }
};

const StopsTable = ({ 
  stops, 
  onStopsChange, 
  useMobileLayout = false,
  readOnly = false,
  masterScheduleId,
  customers: providedCustomers = [],
  drivers: providedDrivers = []
}: StopsTableProps) => {
  console.log("StopsTable rendering with props:", { 
    stopsCount: stops.length, 
    useMobileLayout, 
    readOnly, 
    masterScheduleId 
  });
  
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(providedCustomers);
  const [drivers, setDrivers] = useState<Driver[]>(providedDrivers);
  const [loading, setLoading] = useState(true);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("stop_number");
  const [filterByDriver, setFilterByDriver] = useState<string | null>(null);
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData | undefined>(undefined);
  
  const {
    editingIndex,
    isAddingNewStop,
    customerDialogOpen,
    setCustomerDialogOpen,
    itemsDialogOpen,
    setItemsDialogOpen,
    editForm,
    setEditForm,
    handleAddStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleCustomerSelect,
    handleItemsSelect,
    openCustomerDialog,
    openItemsDialog
  } = useStopsDialogs({
    stops,
    onStopsChange,
    customers,
    drivers,
    initialItems: '',
    masterScheduleId
  });

  console.log("Current dialog states:", { 
    customerDialogOpen, 
    itemsDialogOpen, 
    editingIndex,
    isAddingNewStop
  });

  const fetchData = useCallback(async () => {
    console.log("Fetching data (customers and drivers)");
    // Only fetch data if we don't already have it from props
    if (providedCustomers.length > 0 && providedDrivers.length > 0) {
      console.log("Using provided customers and drivers from props");
      setCustomers(providedCustomers);
      setDrivers(providedDrivers);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // First, make a simple test query to verify connection
      const testQuery = await supabase.from('customers').select('count', { count: 'exact', head: true });
      if (testQuery.error) {
        throw new Error(`Connection test failed: ${testQuery.error.message}`);
      }
      
      // Use consistent query across components
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .order('name');

      if (customersError) {
        throw new Error(`Error fetching customers: ${customersError.message}`);
      }

      console.log(`Fetched ${customersData?.length || 0} customers`);
      
      // Make sure all customers have valid IDs
      const validCustomers = customersData.filter(customer => customer.id);
      console.log(`${validCustomers.length} customers have valid IDs`);
      
      // Handle type field consistently
      const customersWithType = validCustomers.map((customer) => ({
        ...customer,
        type: customer.type || 'RETAIL'
      }));

      setCustomers(customersWithType);

      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

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
        description: handleSupabaseError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, providedCustomers, providedDrivers]);

  useEffect(() => {
    console.log("Running fetchData effect");
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Validate stops against schema
    stops.forEach((stop, index) => {
      const validation = validateAgainstSchema(stop, deliveryStopSchema);
      if (!validation.isValid) {
        console.error(`Stop #${index} validation errors:`, validation.errors);
      }
      
      console.log(`Stop #${index} items:`, stop.items);
      console.log(`Stop #${index} itemsData:`, stop.itemsData);
    });
  }, [stops]);

  const handleRemoveStop = (index: number) => {
    console.log("Removing stop at index:", index);
    const newStops = [...stops];
    newStops.splice(index, 1);
    onStopsChange(newStops);

    updateStopNumbers(newStops);
  };

  const updateStopNumbers = (updatedStops: DeliveryStop[]) => {
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
        setSelectedStops(selectedStops.filter(id => id !== stopId));
      } else {
        setSelectedStops([...selectedStops, stopId]);
      }
    } else {
      setSelectedStops([stopId]);
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

  const sortStops = (a: DeliveryStop, b: DeliveryStop) => {
    const customerA = customers.find(c => c.id === a?.client_id)?.name || "";
    const customerB = customers.find(c => c.id === b?.client_id)?.name || "";
    
    switch (sortBy) {
      case "stop_number":
        return (a.stop_number || 0) - (b.stop_number || 0);
      case "customer":
        return customerA.localeCompare(customerB);
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      default:
        return 0;
    }
  };

  const sortedAndFilteredStops = [...stops]
    .filter(stop => {
      if (!filterByDriver) return true;
      return stop.driver_id === filterByDriver;
    })
    .sort(sortStops);

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

  const handleRecurrenceChange = (data: RecurrenceData | undefined) => {
    setRecurrenceData(data);
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
              <option value="status">Status</option>
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
          initialCustomerId={editForm.client_id}
          initialItems={editForm.items}
          recurrenceData={recurrenceData}
          onRecurrenceChange={handleRecurrenceChange}
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
