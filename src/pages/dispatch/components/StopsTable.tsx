
import React, { useEffect, useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Edit, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "../../customers/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Driver {
  id: string;
  name: string;
}

interface StopProps {
  stops: any[];
  onStopsChange?: (stops: any[]) => void;
  masterScheduleId?: string;
  readOnly?: boolean;
  useMobileLayout?: boolean;
}

export function StopsTable({ 
  stops = [], 
  onStopsChange, 
  masterScheduleId,
  readOnly = false,
  useMobileLayout = false
}: StopProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStop, setCurrentStop] = useState({
    customer_id: "",
    driver_id: "",
    notes: "",
    items: ""
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // Fetch customers and drivers
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order('name');
          
        if (customersError) {
          console.error("Error fetching customers:", customersError);
        } else {
          setCustomers(customersData || []);
        }
        
        // Mock drivers - replace with real data when available
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

  // Handle adding a new stop
  const handleAddStop = () => {
    if (!currentStop.customer_id) {
      return;
    }
    
    // Find the customer to get their address and contact info
    const customer = customers.find(c => c.id === currentStop.customer_id);
    
    const newStop = {
      ...currentStop,
      id: Date.now(), // Temporary id for new stops
      customer_address: customer?.address || '',
      customer_phone: customer?.phone || '',
      price: calculatePrice(currentStop.items),
      master_schedule_id: masterScheduleId
    };
    
    const updatedStops = [...stops, newStop];
    
    // Update with stop numbers
    const numberedStops = updatedStops.map((stop, index) => ({
      ...stop,
      stop_number: index + 1
    }));
    
    if (onStopsChange) {
      onStopsChange(numberedStops);
    }
    
    // Reset the form
    setCurrentStop({
      customer_id: "",
      driver_id: "",
      notes: "",
      items: ""
    });
  };

  // Calculate price based on items (placeholder implementation)
  const calculatePrice = (items: string): number => {
    // This is a placeholder - replace with actual pricing logic
    if (!items) return 0;
    
    // Simple logic: $10 per item
    const itemsList = items.split(',');
    return itemsList.length * 10;
  };

  // Handle removing a stop
  const handleRemoveStop = async (index: number) => {
    const stopToRemove = stops[index];
    
    if (stopToRemove.id && !isNaN(Number(stopToRemove.id))) {
      // This is a new stop with a temporary ID
      const updatedStops = stops.filter((_, i) => i !== index)
        .map((stop, i) => ({ ...stop, stop_number: i + 1 }));
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    } else if (stopToRemove.id && masterScheduleId) {
      try {
        // This is an existing stop in the database
        const { error } = await supabase
          .from('delivery_schedules')
          .delete()
          .eq('id', stopToRemove.id);
          
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
      // Just remove from the array
      const updatedStops = stops.filter((_, i) => i !== index)
        .map((stop, i) => ({ ...stop, stop_number: i + 1 }));
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    }
  };

  // Start editing a stop
  const handleEditStart = (index: number) => {
    const stopToEdit = stops[index];
    setEditingIndex(index);
    setEditForm({
      customer_id: stopToEdit.customer_id,
      driver_id: stopToEdit.driver_id,
      notes: stopToEdit.notes,
      items: stopToEdit.items
    });
  };

  // Save edited stop
  const handleEditSave = async () => {
    if (editingIndex === null) return;
    
    const originalStop = stops[editingIndex];
    
    // Find the customer to get their address and contact info
    const customer = customers.find(c => c.id === editForm.customer_id);
    
    const updatedStop = {
      ...originalStop,
      ...editForm,
      customer_address: customer?.address || '',
      customer_phone: customer?.phone || '',
      price: calculatePrice(editForm.items)
    };
    
    if (updatedStop.id && masterScheduleId && !isNaN(Number(updatedStop.id))) {
      // This is a new stop
      const updatedStops = [...stops];
      updatedStops[editingIndex] = updatedStop;
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    } else if (updatedStop.id && masterScheduleId) {
      try {
        // This is an existing stop in the database
        const { error } = await supabase
          .from('delivery_schedules')
          .update({
            customer_id: editForm.customer_id,
            driver_id: editForm.driver_id,
            notes: editForm.notes,
            items: editForm.items
          })
          .eq('id', updatedStop.id);
          
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
      // Just update in the array
      const updatedStops = [...stops];
      updatedStops[editingIndex] = updatedStop;
      
      if (onStopsChange) {
        onStopsChange(updatedStops);
      }
    }
    
    setEditingIndex(null);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingIndex(null);
  };

  // Render the add stop form
  const renderAddStopForm = () => {
    if (readOnly) return null;
    
    return (
      <div className="border rounded-lg p-4 space-y-4 mb-6">
        <h3 className="text-lg font-medium">Add Delivery Stop</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select 
              value={currentStop.customer_id} 
              onValueChange={(value) => setCurrentStop(prev => ({ ...prev, customer_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Driver</Label>
            <Select 
              value={currentStop.driver_id} 
              onValueChange={(value) => setCurrentStop(prev => ({ ...prev, driver_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
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
          
          <div className="space-y-2">
            <Label>Items</Label>
            <Input 
              placeholder="Enter delivery items..."
              value={currentStop.items || ""}
              onChange={(e) => setCurrentStop(prev => ({ ...prev, items: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              placeholder="Enter delivery notes or special instructions..."
              value={currentStop.notes || ""}
              onChange={(e) => setCurrentStop(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleAddStop}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            disabled={!currentStop.customer_id}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Stop
          </Button>
        </div>
      </div>
    );
  };

  // Desktop table view
  const renderDesktopTable = () => {
    return (
      <div className="mb-6 border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Stop #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Notes</TableHead>
              {!readOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 8 : 9} className="text-center py-6 text-gray-500">
                  No stops added yet.
                </TableCell>
              </TableRow>
            ) : (
              stops.map((stop, index) => {
                const customer = customers.find(c => c.id === stop.customer_id);
                const driver = drivers.find(d => d.id === stop.driver_id);
                
                // If we're editing this row
                if (editingIndex === index) {
                  return (
                    <TableRow key={`edit-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Select 
                          value={editForm.customer_id || ""} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, customer_id: value }))}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{customer?.address || '-'}</TableCell>
                      <TableCell>{customer?.phone || '-'}</TableCell>
                      <TableCell>
                        <Select 
                          value={editForm.driver_id || ""} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, driver_id: value }))}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
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
                          value={editForm.items || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, items: e.target.value }))}
                          disabled={readOnly}
                        />
                      </TableCell>
                      <TableCell>${calculatePrice(editForm.items).toFixed(2)}</TableCell>
                      <TableCell>
                        <Input 
                          value={editForm.notes || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          disabled={readOnly}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleEditSave}
                            className="h-8 w-8 p-0 mr-1"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleEditCancel}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }
                
                // Regular row
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{customer?.name || "Unknown"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{customer?.address || "-"}</TableCell>
                    <TableCell>{customer?.phone || "-"}</TableCell>
                    <TableCell>{driver?.name || "Not assigned"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                    <TableCell>${stop.price || calculatePrice(stop.items).toFixed(2)}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{stop.notes || "-"}</TableCell>
                    {!readOnly && (
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditStart(index)}
                            className="h-8 w-8 p-0 mr-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveStop(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Mobile card view
  const renderMobileCards = () => {
    if (stops.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 border rounded-md mb-6">
          No stops added yet. Add your first stop using the form above.
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mb-6">
        {stops.map((stop, index) => {
          const customer = customers.find(c => c.id === stop.customer_id);
          const driver = drivers.find(d => d.id === stop.driver_id);
          
          // If we're editing this card
          if (editingIndex === index) {
            return (
              <Card key={`edit-${index}`} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-[#2A4131] text-white p-3 flex justify-between items-center">
                    <div className="text-lg font-semibold">Stop #{index + 1}</div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleEditSave}
                        className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleEditCancel}
                        className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Customer</Label>
                        <Select 
                          value={editForm.customer_id || ""} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, customer_id: value }))}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
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
                        <Label>Driver</Label>
                        <Select 
                          value={editForm.driver_id || ""} 
                          onValueChange={(value) => setEditForm(prev => ({ ...prev, driver_id: value }))}
                          disabled={readOnly}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a driver" />
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
                        <Label>Items</Label>
                        <Input 
                          value={editForm.items || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, items: e.target.value }))}
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label>Notes</Label>
                        <Textarea 
                          value={editForm.notes || ""}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          disabled={readOnly}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          // Regular card
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[#2A4131] text-white p-3 flex justify-between items-center">
                  <div className="text-lg font-semibold">Stop #{index + 1}</div>
                  {!readOnly && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditStart(index)}
                        className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveStop(index)}
                        className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Customer</div>
                      <div className="font-medium">{customer?.name || "Unknown"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Driver</div>
                      <div>{driver?.name || "Not assigned"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Address</div>
                      <div>{customer?.address || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div>{customer?.phone || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div>${stop.price || calculatePrice(stop.items).toFixed(2)}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Items</div>
                      <div>{stop.items || "-"}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Notes</div>
                      <div>{stop.notes || "-"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Delivery Stops</h3>
      
      {renderAddStopForm()}
      
      {useMobileLayout ? renderMobileCards() : renderDesktopTable()}
    </div>
  );
}
