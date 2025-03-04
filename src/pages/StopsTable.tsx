/*
import { useState, useEffect } from "react";
import { useDispatchSchedule } from "../context/DispatchScheduleContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "../../customers/types"; // Adjust path as needed

interface Driver {
  id: string;
  name: string;
}

export function StopsTable() {
  const { stops, setStops, addStop, removeStop, updateStop } = useDispatchSchedule();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Current stop being edited
  const [currentStop, setCurrentStop] = useState({
    customer_id: "",
    driver_id: null,
    notes: "",
    items: "",
    sequence: 0
  });

  // Fetch customers and drivers when component mounts
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name, address")
          .order('name');

        if (customersError) throw customersError;
        setCustomers(customersData || []);

        // In a real implementation, fetch drivers from your drivers table
        // For now, using mock data
        setDrivers([
          { id: "driver-1", name: "John Smith" },
          { id: "driver-2", name: "Maria Garcia" },
          { id: "driver-3", name: "Robert Johnson" },
          { id: "driver-4", name: "Sarah Lee" },
        ]);
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
      return; // Don't add if no customer selected
    }
    
    const newStop = {
      ...currentStop,
      sequence: stops.length + 1
    };
    
    addStop(newStop);
    
    // Reset current stop form
    setCurrentStop({
      customer_id: "",
      driver_id: null,
      notes: "",
      items: "",
      sequence: 0
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newStops = [...stops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    
    // Update sequences
    newStops.forEach((stop, i) => {
      stop.sequence = i + 1;
    });
    
    setStops(newStops);
  };

  const handleMoveDown = (index: number) => {
    if (index === stops.length - 1) return;
    
    const newStops = [...stops];
    [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    
    // Update sequences
    newStops.forEach((stop, i) => {
      stop.sequence = i + 1;
    });
    
    setStops(newStops);
  };

  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const getDriverById = (id: string | null) => {
    if (!id) return null;
    return drivers.find(d => d.id === id);
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Delivery Stops</h3>
      
      {/* Add new stop form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <Select
            value={currentStop.customer_id}
            onValueChange={(value) => setCurrentStop({...currentStop, customer_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Driver</label>
          <Select
            value={currentStop.driver_id || ""}
            onValueChange={(value) => setCurrentStop({...currentStop, driver_id: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Items</label>
          <Input
            value={currentStop.items || ""}
            onChange={(e) => setCurrentStop({...currentStop, items: e.target.value})}
            placeholder="Items to deliver"
          />
        </div>
        
        <div className="md:flex md:items-end md:justify-end">
          <Button 
            onClick={handleAddStop} 
            className="w-full md:w-auto bg-[#2A4131] hover:bg-[#2A4131]/90"
            disabled={!currentStop.customer_id}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stop
          </Button>
        </div>
      </div>
      
      {/* Notes field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Notes</label>
        <Input
          value={currentStop.notes || ""}
          onChange={(e) => setCurrentStop({...currentStop, notes: e.target.value})}
          placeholder="Delivery notes or special instructions"
        />
      </div>
      
      {/* Stops table */}
      {stops.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Seq</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.map((stop, index) => {
              const customer = getCustomerById(stop.customer_id);
              const driver = getDriverById(stop.driver_id);
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{stop.sequence}</TableCell>
                  <TableCell>{customer?.name || "Unknown"}</TableCell>
                  <TableCell>{driver?.name || "Unassigned"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{stop.notes || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{customer?.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMoveDown(index)}
                        disabled={index === stops.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeStop(index)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No stops added yet. Add your first stop above.
        </div>
      )}
    </div>
  );
}
/*
