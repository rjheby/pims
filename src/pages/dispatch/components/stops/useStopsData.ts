import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/pages/customers/types";
import { Driver, StopFormData, DeliveryStop } from "./types";
import { calculatePrice } from "./utils";

export const useStopsData = (
  stops: DeliveryStop[],
  onStopsChange?: (stops: DeliveryStop[]) => void,
  masterScheduleId?: string
) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStop, setCurrentStop] = useState<StopFormData>({
    customer_id: "",
    driver_id: "",
    notes: "",
    items: ""
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<StopFormData>({
    customer_id: "",
    driver_id: "",
    notes: "",
    items: ""
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order('name');
          
        if (customersError) {
          console.error("Error fetching customers:", customersError);
        } else {
          setCustomers(customersData || []);
        }
        
        const { data: driversData, error: driversError } = await supabase
          .from("drivers")
          .select("*")
          .eq('status', 'active')
          .order('name');
          
        if (driversError) {
          console.error("Error fetching drivers:", driversError);
          setDrivers([
            { id: "driver-1", name: "John Smith" },
            { id: "driver-2", name: "Maria Garcia" },
            { id: "driver-3", name: "Robert Johnson" },
            { id: "driver-4", name: "Sarah Lee" },
          ]);
        } else if (driversData && driversData.length > 0) {
          const formattedDrivers = driversData.map(driver => ({
            id: driver.id,
            name: driver.name
          }));
          setDrivers(formattedDrivers);
        } else {
          setDrivers([
            { id: "driver-1", name: "John Smith" },
            { id: "driver-2", name: "Maria Garcia" },
            { id: "driver-3", name: "Robert Johnson" },
            { id: "driver-4", name: "Sarah Lee" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleAddStop = () => {
    if (!currentStop.customer_id) {
      return;
    }
    
    const customer = customers.find(c => c.id === currentStop.customer_id);
    
    const newStop = {
      ...currentStop,
      id: Date.now(),
      customer_address: customer?.address || '',
      customer_phone: customer?.phone || '',
      price: calculatePrice(currentStop.items),
      master_schedule_id: masterScheduleId
    };
    
    const updatedStops = [...stops, newStop];
    
    const numberedStops = updatedStops.map((stop, index) => ({
      ...stop,
      stop_number: index + 1
    }));
    
    if (onStopsChange) {
      onStopsChange(numberedStops);
    }
    
    setCurrentStop({
      customer_id: "",
      driver_id: "",
      notes: "",
      items: ""
    });
  };

  const handleRemoveStop = async (index: number) => {
    const stopToRemove = stops[index];
    
    if (stopToRemove.id && !isNaN(Number(stopToRemove.id))) {
      const updatedStops = stops.filter((_, i) => i !== index)
        .map((stop, i) => ({ ...stop, stop_number: i + 1 }));
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    } else if (stopToRemove.id && masterScheduleId) {
      try {
        const stopId = String(stopToRemove.id);
        
        const { error } = await supabase
          .from('delivery_schedules')
          .delete()
          .eq('id', stopId);
          
        if (error) {
          console.error("Error deleting stop:", error);
          return;
        }
        
        const updatedStops = stops.filter((_, i) => i !== index)
          .map((stop, i) => ({ ...stop, stop_number: i + 1 }));
        
        if (onStopsChange) {
          onStopsChange(updatedStops);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      const updatedStops = stops.filter((_, i) => i !== index)
        .map((stop, i) => ({ ...stop, stop_number: i + 1 }));
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    }
  };

  const handleEditStart = (index: number) => {
    const stopToEdit = stops[index];
    setEditingIndex(index);
    setEditForm({
      customer_id: stopToEdit.customer_id || "",
      driver_id: stopToEdit.driver_id || "",
      notes: stopToEdit.notes || "",
      items: stopToEdit.items || "",
      stop_number: stopToEdit.stop_number
    });
  };

  const handleEditSave = async () => {
    if (editingIndex === null) return;
    
    const originalStop = stops[editingIndex];
    
    const customer = customers.find(c => c.id === editForm.customer_id);
    
    const updatedStop = {
      ...originalStop,
      ...editForm,
      customer_address: customer?.address || '',
      customer_phone: customer?.phone || '',
      price: calculatePrice(editForm.items)
    };
    
    if (updatedStop.id && masterScheduleId && !isNaN(Number(updatedStop.id))) {
      const updatedStops = [...stops];
      updatedStops[editingIndex] = updatedStop;
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    } else if (updatedStop.id && masterScheduleId) {
      try {
        const stopId = String(updatedStop.id);
        
        const { error } = await supabase
          .from('delivery_schedules')
          .update({
            customer_id: editForm.customer_id,
            driver_id: editForm.driver_id,
            notes: editForm.notes,
            items: editForm.items
          })
          .eq('id', stopId);
          
        if (error) {
          console.error("Error updating stop:", error);
          return;
        }
        
        const updatedStops = [...stops];
        updatedStops[editingIndex] = updatedStop;
        
        if (onStopsChange) {
          onStopsChange(updatedStops);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      const updatedStops = [...stops];
      updatedStops[editingIndex] = updatedStop;
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    }
    
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  const handleDriverAssign = async (stopId: string | number, driverId: string) => {
    const stopIndex = stops.findIndex(stop => stop.id === stopId);
    if (stopIndex === -1) return;
    
    const updatedStop = {
      ...stops[stopIndex],
      driver_id: driverId
    };
    
    if (updatedStop.id && masterScheduleId && typeof updatedStop.id === 'string') {
      try {
        const { error } = await supabase
          .from('delivery_schedules')
          .update({
            driver_id: driverId
          })
          .eq('id', updatedStop.id);
          
        if (error) {
          console.error("Error updating driver:", error);
          return;
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    
    const updatedStops = [...stops];
    updatedStops[stopIndex] = updatedStop;
    
    if (onStopsChange) {
      onStopsChange(updatedStops);
    }
  };

  return {
    customers,
    drivers,
    loading,
    currentStop,
    setCurrentStop,
    editingIndex,
    editForm,
    setEditForm,
    handleAddStop,
    handleRemoveStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDriverAssign
  };
};
