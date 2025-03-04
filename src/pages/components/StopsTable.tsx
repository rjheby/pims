
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StopsTableProps {
  stops: any[];
  masterScheduleId: string;
  readOnly?: boolean;
  onStopsChange?: (stops: any[]) => void;
}

export function StopsTable({ stops, masterScheduleId, readOnly = false, onStopsChange }: StopsTableProps) {
  const [stopsData, setStopsData] = useState<any[]>(stops || []);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch customers and drivers when component mounts
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name, address")
          .order("name");
        
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from("drivers")
          .select("id, name")
          .eq("status", "active")
          .order("name");
        
        if (driversError) throw driversError;
        setDrivers(driversData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load necessary data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Update local state when props change
  useEffect(() => {
    if (stops && JSON.stringify(stops) !== JSON.stringify(stopsData)) {
      setStopsData(stops);
    }
  }, [stops]);

  const handleAddStop = () => {
    const newStop = {
      id: `temp-${Date.now()}`,
      customer_id: "",
      driver_id: "",
      notes: "",
      items: "",
      status: "draft",
      master_schedule_id: masterScheduleId,
      sequence: stopsData.length + 1,
      isNew: true
    };
    
    const updatedStops = [...stopsData, newStop];
    setStopsData(updatedStops);
    if (onStopsChange) onStopsChange(updatedStops);
  };

  const handleRemoveStop = (index: number) => {
    const updatedStops = stopsData.filter((_, i) => i !== index);
    // Update sequence numbers
    updatedStops.forEach((stop, i) => {
      stop.sequence = i + 1;
    });
    
    setStopsData(updatedStops);
    if (onStopsChange) onStopsChange(updatedStops);
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    const updatedStops = [...stopsData];
    updatedStops[index][field] = value;
    
    // If changing customer, maybe update address or other customer-specific info
    if (field === "customer_id") {
      const selectedCustomer = customers.find(c => c.id === value);
      if (selectedCustomer) {
        updatedStops[index].customer = selectedCustomer;
      }
    }
    
    setStopsData(updatedStops);
    if (onStopsChange) onStopsChange(updatedStops);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(stopsData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update sequence numbers
    items.forEach((item, index) => {
      item.sequence = index + 1;
    });
    
    setStopsData(items);
    if (onStopsChange) onStopsChange(items);
  };

  if (loading) {
    return <div>Loading stop data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Delivery Stops</h3>
        {!readOnly && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAddStop}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stop
          </Button>
        )}
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stops">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="border rounded-md"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    {!readOnly && <TableHead style={{ width: '40px' }}></TableHead>}
                    <TableHead>Customer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    {!readOnly && <TableHead style={{ width: '80px' }}>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stopsData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={readOnly ? 5 : 7} className="text-center py-4 text-muted-foreground">
                        No stops added yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    stopsData.map((stop, index) => (
                      <Draggable 
                        key={stop.id} 
                        draggableId={stop.id} 
                        index={index}
                        isDragDisabled={readOnly}
                      >
                        {(provided) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            {!readOnly && (
                              <TableCell {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </TableCell>
                            )}
                            <TableCell>
                              {readOnly ? (
                                stop.customer?.name || "Unknown"
                              ) : (
                                <Select
                                  value={stop.customer_id}
                                  onValueChange={(value) => handleFieldChange(index, "customer_id", value)}
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
                              )}
                            </TableCell>
                            <TableCell>
                              {readOnly ? (
                                stop.driver?.name || "Unassigned"
                              ) : (
                                <Select
                                  value={stop.driver_id || ""}
                                  onValueChange={(value) => handleFieldChange(index, "driver_id", value)}
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
                              )}
                            </TableCell>
                            <TableCell>
                              {readOnly ? (
                                stop.items || "-"
                              ) : (
                                <Input
                                  value={stop.items || ""}
                                  onChange={(e) => handleFieldChange(index, "items", e.target.value)}
                                  placeholder="Items to deliver"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {readOnly ? (
                                stop.notes || "-"
                              ) : (
                                <Input
                                  value={stop.notes || ""}
                                  onChange={(e) => handleFieldChange(index, "notes", e.target.value)}
                                  placeholder="Delivery notes"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                stop.status === "submitted" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {stop.status === "submitted" ? "Submitted" : "Draft"}
                              </span>
                            </TableCell>
                            {!readOnly && (
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveStop(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
