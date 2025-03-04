import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { Customer } from "./customers/types";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeliveryStop {
  id?: number;
  customer_id: string | null;
  notes: string | null;
  driver_id: string | null;
  items: string | null;
}

interface DispatchScheduleData {
  schedule_number: string;
  schedule_date: string;
  stops: DeliveryStop[];
}

interface Driver {
  id: string;
  name: string;
}

export default function DispatchDelivery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // States
  const [scheduleData, setScheduleData] = useState<DispatchScheduleData>({
    schedule_number: `DS-${new Date().getTime().toString().slice(-8)}`,
    schedule_date: new Date().toISOString().split('T')[0],
    stops: []
  });
  
  const [currentStop, setCurrentStop] = useState<DeliveryStop>({
    customer_id: null,
    driver_id: null,
    notes: null,
    items: null
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers and drivers
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .order('name');

        if (error) {
          console.error("Error fetching customers:", error);
          return;
        }
        
        setCustomers(data as Customer[] || []);
        
        // Mock drivers - replace with real data when available
        setDrivers([
          { id: "driver-1", name: "John Smith" },
          { id: "driver-2", name: "Maria Garcia" },
          { id: "driver-3", name: "Robert Johnson" },
          { id: "driver-4", name: "Sarah Lee" },
        ]);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle schedule date change
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleData(prev => ({
      ...prev,
      schedule_date: e.target.value
    }));
  };

  // Add stop to schedule
  const handleAddStop = () => {
    if (!currentStop.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    setScheduleData(prev => ({
      ...prev,
      stops: [...prev.stops, currentStop]
    }));

    // Reset the form
    setCurrentStop({
      customer_id: null,
      driver_id: null,
      notes: null,
      items: null
    });
  };

  // Remove stop from schedule
  const handleRemoveStop = (index: number) => {
    setScheduleData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  // Calculate summary totals
  const calculateTotals = () => {
    const totalStops = scheduleData.stops.length;
    
    // Count stops by driver
    const stopsByDriver = scheduleData.stops.reduce((acc: Record<string, number>, stop) => {
      const driverId = stop.driver_id || 'unassigned';
      const driverName = drivers.find(d => d.id === driverId)?.name || 'Unassigned';
      const key = driverId === 'unassigned' ? 'Unassigned' : driverName;
      
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalQuantity: totalStops,
      totalValue: totalStops, // Just using count as the "value"
      quantityByPackaging: stopsByDriver
    };
  };

  // Validate before save/submit
  const validateSchedule = () => {
    if (!scheduleData.schedule_date) {
      throw new Error("Schedule date is required");
    }

    if (scheduleData.stops.length === 0) {
      throw new Error("At least one delivery stop is required");
    }
    
    return true;
  };

  // Save as draft
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      validateSchedule();
      
      // First create the master dispatch schedule
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: scheduleData.schedule_number,
          schedule_date: scheduleData.schedule_date,
          status: 'draft',
          notes: ''
        })
        .select();
        
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Then create all the delivery stops
      for (const stop of scheduleData.stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleData.schedule_date,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'draft',
            master_schedule_id: masterId
          });
      }
      
      toast({
        title: "Success",
        description: "Schedule saved as draft"
      });
      
      // Navigate to the edit form
      navigate(`/dispatch-form/${masterId}`);
      
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Submit schedule
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      validateSchedule();
      
      // First create the master schedule
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: scheduleData.schedule_number,
          schedule_date: scheduleData.schedule_date,
          status: 'submitted',
          notes: ''
        })
        .select();
        
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Then create all the delivery stops
      for (const stop of scheduleData.stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleData.schedule_date,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'submitted',
            master_schedule_id: masterId
          });
      }
      
      toast({
        title: "Success",
        description: "Schedule submitted successfully"
      });
      
      // Navigate to archive
      navigate('/dispatch-archive');
      
    } catch (error: any) {
      console.error('Error submitting schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit schedule",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>New Dispatch Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Schedule Details Section */}
            <BaseOrderDetails
              orderNumber={scheduleData.schedule_number}
              orderDate={scheduleData.schedule_date}
              deliveryDate="" // Not using delivery date field
              onOrderDateChange={handleScheduleDateChange}
              onDeliveryDateChange={() => {}} // Not used
              disabled={false}
            />
            
            {/* Add Stop Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">Add Delivery Stop</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select 
                    value={currentStop.customer_id || ""} 
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
                    value={currentStop.driver_id || ""} 
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
                
                <div className="space-y-2 md:col-span-3">
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
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stop
                </Button>
              </div>
            </div>
            
            {/* Stops Table */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Delivery Stops</h3>
              
              {scheduleData.stops.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleData.stops.map((stop, index) => {
                      const customer = customers.find(c => c.id === stop.customer_id);
                      const driver = drivers.find(d => d.id === stop.driver_id);
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{customer?.name || "Unknown"}</TableCell>
                          <TableCell>{driver?.name || "Not assigned"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{stop.notes || "-"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{customer?.address || "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveStop(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500 border rounded-md">
                  No stops added yet. Add your first stop using the form above.
                </div>
              )}
            </div>
            
            {/* Summary and Actions */}
            <BaseOrderSummary 
              items={calculateTotals()}
            />
            
            <BaseOrderActions
              onSave={handleSave}
              onSubmit={handleSubmit}
              submitLabel="Submit Schedule"
              archiveLink="/dispatch-archive"
              isSaving={isSaving}
              isSubmitting={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
