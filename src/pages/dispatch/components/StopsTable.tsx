
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDispatchSchedule } from "../context/DispatchScheduleContext";
import { Customer } from "@/pages/customers/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Driver {
  id: string;
  name: string;
}

export interface StopsTableProps {
  stops?: any[];
  masterScheduleId?: string;
  readOnly?: boolean;
  onStopsChange?: (stops: any[]) => void;
  useMobileLayout?: boolean;
}

export function StopsTable({ 
  stops: externalStops, 
  masterScheduleId,
  readOnly = false,
  onStopsChange,
  useMobileLayout = false
}: StopsTableProps) {
  const { stops: contextStops, addStop, removeStop, updateStop } = useDispatchSchedule();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStop, setNewStop] = useState({
    customer_id: "",
    driver_id: null,
    items: "",
    notes: "",
    sequence: 0
  });
  const { toast } = useToast();
  
  // Use external stops if provided, otherwise use context stops
  const stops = externalStops || contextStops;
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order('name');
        
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        // Temporary mock data for drivers until we have a drivers table
        // TODO: Replace with real drivers data from the database
        setDrivers([
          { id: "driver-1", name: "John Smith" },
          { id: "driver-2", name: "Maria Garcia" },
          { id: "driver-3", name: "Robert Johnson" },
          { id: "driver-4", name: "Sarah Lee" },
        ]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [toast]);

  const handleAddStop = () => {
    if (!newStop.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    const stopToAdd = {
      ...newStop,
      sequence: stops.length + 1
    };

    if (masterScheduleId) {
      // If we have a masterScheduleId, this is an existing schedule
      // Add the stop to the database
      supabase
        .from("delivery_schedules")
        .insert({
          customer_id: stopToAdd.customer_id,
          driver_id: stopToAdd.driver_id,
          items: stopToAdd.items,
          notes: stopToAdd.notes,
          master_schedule_id: masterScheduleId,
          schedule_type: "one-time",
          status: "draft"
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("Error adding stop:", error);
            toast({
              title: "Error",
              description: "Failed to add stop",
              variant: "destructive"
            });
            return;
          }
          
          // Add the stop to the local state
          // Fix: Add null check for data
          const newStops = [...stops, { ...(data && data[0] ? data[0] : {}), customers: customers.find(c => c.id === stopToAdd.customer_id) }];
          if (onStopsChange) onStopsChange(newStops);
          
          toast({
            title: "Success",
            description: "Stop added successfully"
          });
        });
    } else {
      // If no masterScheduleId, this is a new schedule
      // Add the stop to the context
      addStop(stopToAdd);
    }

    // Reset the form
    setNewStop({
      customer_id: "",
      driver_id: null,
      items: "",
      notes: "",
      sequence: 0
    });
  };

  const handleRemoveStop = (index: number, stopId?: string) => {
    if (masterScheduleId && stopId) {
      // If we have a masterScheduleId, this is an existing schedule
      // Remove the stop from the database
      supabase
        .from("delivery_schedules")
        .delete()
        .eq("id", stopId)
        .then(({ error }) => {
          if (error) {
            console.error("Error removing stop:", error);
            toast({
              title: "Error",
              description: "Failed to remove stop",
              variant: "destructive"
            });
            return;
          }
          
          // Remove the stop from the local state
          const newStops = stops.filter((_, i) => i !== index);
          if (onStopsChange) onStopsChange(newStops);
          
          toast({
            title: "Success",
            description: "Stop removed successfully"
          });
        });
    } else {
      // If no masterScheduleId, this is a new schedule
      // Remove the stop from the context
      removeStop(index);
    }
  };

  const handleUpdateStop = (index: number, field: string, value: any, stopId?: string) => {
    const updatedStop = { ...stops[index], [field]: value };
    
    if (masterScheduleId && stopId) {
      // If we have a masterScheduleId, this is an existing schedule
      // Update the stop in the database
      supabase
        .from("delivery_schedules")
        .update({ [field]: value })
        .eq("id", stopId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating stop:", error);
            toast({
              title: "Error",
              description: "Failed to update stop",
              variant: "destructive"
            });
            return;
          }
          
          // Update the stop in the local state
          const newStops = [...stops];
          newStops[index] = updatedStop;
          if (onStopsChange) onStopsChange(newStops);
        });
    } else {
      // If no masterScheduleId, this is a new schedule
      // Update the stop in the context
      updateStop(index, updatedStop);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  // Mobile layout for the stops table
  if (useMobileLayout) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-medium">Delivery Stops</div>
        
        {stops.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-gray-50">
            No stops added yet
          </div>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, index) => {
              const customer = customers.find(c => c.id === stop.customer_id) || stop.customers;
              const driver = drivers.find(d => d.id === stop.driver_id);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        <CardTitle className="text-base font-medium">
                          {customer?.name || "Unknown Customer"}
                        </CardTitle>
                      </div>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStop(index, stop.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Driver</label>
                        {readOnly ? (
                          <p className="text-sm">{driver?.name || "Not Assigned"}</p>
                        ) : (
                          <Select
                            value={stop.driver_id || ""}
                            onValueChange={(value) => handleUpdateStop(index, "driver_id", value, stop.id)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Items</label>
                        {readOnly ? (
                          <p className="text-sm">{stop.items || "-"}</p>
                        ) : (
                          <Input
                            value={stop.items || ""}
                            onChange={(e) => handleUpdateStop(index, "items", e.target.value, stop.id)}
                            placeholder="Enter items"
                          />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Notes</label>
                        {readOnly ? (
                          <p className="text-sm">{stop.notes || "-"}</p>
                        ) : (
                          <Input
                            value={stop.notes || ""}
                            onChange={(e) => handleUpdateStop(index, "notes", e.target.value, stop.id)}
                            placeholder="Add notes"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {!readOnly && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base font-medium">Add New Stop</CardTitle>
            </CardHeader>
            <CardContent className="py-3 space-y-3">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Customer</label>
                  <Select
                    value={newStop.customer_id}
                    onValueChange={(value) => setNewStop({...newStop, customer_id: value})}
                  >
                    <SelectTrigger className="w-full">
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
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Driver</label>
                  <Select
                    value={newStop.driver_id || ""}
                    onValueChange={(value) => setNewStop({...newStop, driver_id: value})}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Items</label>
                  <Input
                    value={newStop.items || ""}
                    onChange={(e) => setNewStop({...newStop, items: e.target.value})}
                    placeholder="Enter items"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Notes</label>
                  <Input
                    value={newStop.notes || ""}
                    onChange={(e) => setNewStop({...newStop, notes: e.target.value})}
                    placeholder="Add notes"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleAddStop}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Desktop layout for the stops table
  return (
    <div className="space-y-4">
      <div className="text-lg font-medium">Delivery Stops</div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">#</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No stops added yet
              </TableCell>
            </TableRow>
          ) : (
            stops.map((stop, index) => {
              const customer = customers.find(c => c.id === stop.customer_id) || stop.customers;
              const driver = drivers.find(d => d.id === stop.driver_id);
              
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {readOnly ? (
                      customer?.name || "Unknown Customer"
                    ) : (
                      <Select
                        value={stop.customer_id}
                        onValueChange={(value) => handleUpdateStop(index, "customer_id", value, stop.id)}
                      >
                        <SelectTrigger className="w-full">
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
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      driver?.name || "Not Assigned"
                    ) : (
                      <Select
                        value={stop.driver_id || ""}
                        onValueChange={(value) => handleUpdateStop(index, "driver_id", value, stop.id)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      stop.items || "-"
                    ) : (
                      <Input
                        value={stop.items || ""}
                        onChange={(e) => handleUpdateStop(index, "items", e.target.value, stop.id)}
                        placeholder="Enter items"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      stop.notes || "-"
                    ) : (
                      <Input
                        value={stop.notes || ""}
                        onChange={(e) => handleUpdateStop(index, "notes", e.target.value, stop.id)}
                        placeholder="Add notes"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!readOnly && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveStop(index, stop.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
          
          {!readOnly && (
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>
                <Select
                  value={newStop.customer_id}
                  onValueChange={(value) => setNewStop({...newStop, customer_id: value})}
                >
                  <SelectTrigger className="w-full">
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
              </TableCell>
              <TableCell>
                <Select
                  value={newStop.driver_id || ""}
                  onValueChange={(value) => setNewStop({...newStop, driver_id: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={newStop.items || ""}
                  onChange={(e) => setNewStop({...newStop, items: e.target.value})}
                  placeholder="Enter items"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newStop.notes || ""}
                  onChange={(e) => setNewStop({...newStop, notes: e.target.value})}
                  placeholder="Add notes"
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddStop}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
