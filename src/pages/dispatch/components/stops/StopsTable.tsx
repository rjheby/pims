
import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/pages/customers/types";
import { supabase } from "@/integrations/supabase/client";
import { StopsDesktopTable } from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { Driver, StopFormData } from "./types";

interface StopsTableProps {
  stops: any[];
  onStopsChange: (newStops: any[]) => void;
  useMobileLayout?: boolean;
  readOnly?: boolean;
}

const StopsTable = ({ 
  stops, 
  onStopsChange, 
  useMobileLayout = false,
  readOnly = false 
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        throw new Error(`Error fetching customers: ${customersError.message}`);
      }

      setCustomers(customersData || []);

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
    const newStop = {
      customer_id: null,
      notes: null,
      driver_id: null,
      items: null,
      price: 0,
    };
    const newStops = [...stops, newStop];
    onStopsChange(newStops);

    // Update stop numbers
    updateStopNumbers(newStops);
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    const stopToEdit = stops[index];
    setEditForm({
      customer_id: stopToEdit.customer_id || null,
      notes: stopToEdit.notes || null,
      driver_id: stopToEdit.driver_id || null,
      items: stopToEdit.items || null,
    });
  };

  const handleEditSave = () => {
    const newStops = [...stops];
    newStops[editingIndex] = {
      ...newStops[editingIndex],
      ...editForm,
    };
    onStopsChange(newStops);
    setEditingIndex(-1);

    // Update stop numbers
    updateStopNumbers(newStops);
  };

  const handleEditCancel = () => {
    setEditingIndex(-1);
  };

  const handleRemoveStop = (index: number) => {
    const newStops = [...stops];
    newStops.splice(index, 1);
    onStopsChange(newStops);

    // Update stop numbers
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
    
    // Convert regular Event to MouseEvent if needed
    const mouseEvent = event as unknown as React.MouseEvent;

    if (mouseEvent.shiftKey) {
      // Shift key is pressed, handle multiple selection
      if (selectedStops.includes(stopId)) {
        // If the stop is already selected, remove it from the selection
        setSelectedStops(selectedStops.filter((id) => id !== stopId));
      } else {
        // If the stop is not selected, add it to the selection
        setSelectedStops([...selectedStops, stopId]);
      }
    } else {
      // Shift key is not pressed, handle single selection
      if (selectedStops.includes(stopId)) {
        // If the stop is already selected, unselect it
        setSelectedStops([]);
      } else {
        // If the stop is not selected, select it
        setSelectedStops([stopId]);
      }
    }
  };

  // Add duplicate functionality
  const handleDuplicateStop = (index: number) => {
    const stopToDuplicate = { ...stops[index] };
    // Remove id to create a new record when saved
    delete stopToDuplicate.id;
    
    // Add to the end of the list
    const newStops = [...stops, stopToDuplicate];
    onStopsChange(newStops);
    
    // Update stop numbers if needed
    updateStopNumbers(newStops);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <h3 className="text-lg font-medium">Delivery Stops</h3>
      
      <AddStopForm onAddStop={handleAddStop} />
      
      {stops.length > 0 ? (
        useMobileLayout ? (
          <StopsMobileCards
            stops={stops}
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
          />
        ) : (
          <StopsDesktopTable
            stops={stops}
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
            draggable={false}
          />
        )
      ) : (
        <p className="text-gray-500">No delivery stops added yet.</p>
      )}
    </div>
  );
};

interface AddStopFormProps {
  onAddStop: () => void;
}

const AddStopForm: React.FC<AddStopFormProps> = ({ onAddStop }) => {
  return (
    <Button variant="outline" onClick={onAddStop}>
      <Plus className="mr-2 h-4 w-4" />
      Add Stop
    </Button>
  );
};

export default StopsTable;
