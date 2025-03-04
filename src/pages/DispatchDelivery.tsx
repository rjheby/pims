
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Plus, Trash } from "lucide-react";
import { Customer } from "./customers/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";

interface DeliveryItem {
  id?: string;
  customer_id: string | null;
  notes: string | null;
  driver_id: string | null;
  items: string | null;
}

interface DeliverySchedule {
  id?: string;
  schedule_type: "one-time" | "recurring" | "bi-weekly";
  recurring_day: string | null;
  delivery_date: Date | null;
  items: DeliveryItem[];
  unscheduled_items: DeliveryItem[];
}

interface Driver {
  id: string;
  name: string;
}

export default function DispatchDelivery() {
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule>({
    schedule_type: "one-time",
    recurring_day: null,
    delivery_date: null,
    items: [],
    unscheduled_items: []
  });
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryItem>({
    customer_id: null,
    notes: null,
    driver_id: null,
    items: null,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch customers from the database
  useEffect(() => {
    async function fetchCustomers() {
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
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
    
    // Temporary mock data for drivers until we have a drivers table
    setDrivers([
      { id: "driver-1", name: "John Smith" },
      { id: "driver-2", name: "Maria Garcia" },
      { id: "driver-3", name: "Robert Johnson" },
      { id: "driver-4", name: "Sarah Lee" },
    ]);
  }, []);

  // Find the selected customer by ID
  const selectedCustomer = customers.find(c => c.id === currentDelivery.customer_id);

  const handleAddDelivery = () => {
    if (!currentDelivery.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    setDeliverySchedule(prev => ({
      ...prev,
      items: [...prev.items, { ...currentDelivery }]
    }));

    // Reset current delivery form
    setCurrentDelivery({
      customer_id: null,
      notes: null,
      driver_id: null,
      items: null,
    });
  };

  const handleAddToUnscheduled = () => {
    if (!currentDelivery.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }

    setDeliverySchedule(prev => ({
      ...prev,
      unscheduled_items: [...prev.unscheduled_items, { ...currentDelivery }]
    }));

    // Reset current delivery form
    setCurrentDelivery({
      customer_id: null,
      notes: null,
      driver_id: null,
      items: null,
    });
  };

  const handleRemoveDelivery = (index: number) => {
    setDeliverySchedule(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveUnscheduledDelivery = (index: number) => {
    setDeliverySchedule(prev => ({
      ...prev,
      unscheduled_items: prev.unscheduled_items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (deliverySchedule.items.length === 0 && deliverySchedule.unscheduled_items.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one delivery",
          variant: "destructive"
        });
        return;
      }

      if (!deliverySchedule.delivery_date && deliverySchedule.schedule_type === "one-time" && deliverySchedule.items.length > 0) {
        toast({
          title: "Error",
          description: "Please select a delivery date",
          variant: "destructive"
        });
        return;
      }

      if (!deliverySchedule.recurring_day && 
          (deliverySchedule.schedule_type === "recurring" || deliverySchedule.schedule_type === "bi-weekly") && 
          deliverySchedule.items.length > 0) {
        toast({
          title: "Error",
          description: "Please select a day for recurring delivery",
          variant: "destructive"
        });
        return;
      }

      // Process scheduled items
      for (const item of deliverySchedule.items) {
        await supabase
          .from("delivery_schedules")
          .insert({
            customer_id: item.customer_id,
            schedule_type: deliverySchedule.schedule_type,
            recurring_day: deliverySchedule.recurring_day,
            delivery_date: deliverySchedule.delivery_date ? deliverySchedule.delivery_date.toISOString() : null,
            notes: item.notes,
            driver_id: item.driver_id,
            items: item.items,
            status: "draft"
          });
      }

      // Process unscheduled items
      for (const item of deliverySchedule.unscheduled_items) {
        await supabase
          .from("delivery_schedules")
          .insert({
            customer_id: item.customer_id,
            schedule_type: "one-time", // Default for unscheduled
            notes: item.notes,
            driver_id: item.driver_id,
            items: item.items,
            status: "draft"
          });
      }
      
      toast({
        title: "Success",
        description: "Delivery schedules saved successfully"
      });

      // Reset form after successful save
      setDeliverySchedule({
        schedule_type: "one-time",
        recurring_day: null,
        delivery_date: null,
        items: [],
        unscheduled_items: []
      });
    } catch (error) {
      console.error("Error saving delivery schedules:", error);
      toast({
        title: "Error",
        description: "Failed to save delivery schedules",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (deliverySchedule.items.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one delivery to the schedule",
          variant: "destructive"
        });
        return;
      }

      if (!deliverySchedule.delivery_date && deliverySchedule.schedule_type === "one-time") {
        toast({
          title: "Error",
          description: "Please select a delivery date",
          variant: "destructive"
        });
        return;
      }
      
      if (!deliverySchedule.recurring_day && 
          (deliverySchedule.schedule_type === "recurring" || deliverySchedule.schedule_type === "bi-weekly")) {
        toast({
          title: "Error",
          description: "Please select a day for recurring delivery",
          variant: "destructive"
        });
        return;
      }

      // Process scheduled items with submitted status
      for (const item of deliverySchedule.items) {
        await supabase
          .from("delivery_schedules")
          .insert({
            customer_id: item.customer_id,
            schedule_type: deliverySchedule.schedule_type,
            recurring_day: deliverySchedule.recurring_day,
            delivery_date: deliverySchedule.delivery_date ? deliverySchedule.delivery_date.toISOString() : null,
            notes: item.notes,
            driver_id: item.driver_id,
            items: item.items,
            status: "submitted"
          });
      }
      
      toast({
        title: "Success",
        description: "Delivery schedules submitted successfully"
      });
      
      // Reset form after successful submission
      setDeliverySchedule({
        schedule_type: "one-time",
        recurring_day: null,
        delivery_date: null,
        items: [],
        unscheduled_items: []
      });
    } catch (error) {
      console.error("Error submitting delivery schedules:", error);
      toast({
        title: "Error",
        description: "Failed to submit delivery schedules",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClientCell = () => (
    <div className="flex items-center space-x-2">
      <Select 
        value={currentDelivery.customer_id || ""} 
        onValueChange={(value) => setCurrentDelivery(prev => ({ ...prev, customer_id: value }))}
      >
        <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
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
  );

  const renderScheduleCell = () => (
    <div className="flex items-center flex-wrap gap-2">
      <Select 
        value={deliverySchedule.schedule_type} 
        onValueChange={(value: "one-time" | "recurring" | "bi-weekly") => 
          setDeliverySchedule(prev => ({ ...prev, schedule_type: value }))
        }
      >
        <SelectTrigger className={isMobile ? "w-full" : "w-[120px]"}>
          <SelectValue placeholder="Schedule type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one-time">One-time</SelectItem>
          <SelectItem value="recurring">Weekly</SelectItem>
          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
        </SelectContent>
      </Select>

      {deliverySchedule.schedule_type === "one-time" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={`${isMobile ? "w-full" : "w-[140px]"} justify-start text-left font-normal`}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deliverySchedule.delivery_date ? format(deliverySchedule.delivery_date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={deliverySchedule.delivery_date || undefined}
              onSelect={(date) => setDeliverySchedule(prev => ({ ...prev, delivery_date: date }))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Select 
          value={deliverySchedule.recurring_day || ""} 
          onValueChange={(value) => setDeliverySchedule(prev => ({ ...prev, recurring_day: value }))}
        >
          <SelectTrigger className={isMobile ? "w-full" : "w-[140px]"}>
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {deliverySchedule.schedule_type === "recurring" ? (
              <>
                <SelectItem value="monday">Every Monday</SelectItem>
                <SelectItem value="tuesday">Every Tuesday</SelectItem>
                <SelectItem value="wednesday">Every Wednesday</SelectItem>
                <SelectItem value="thursday">Every Thursday</SelectItem>
                <SelectItem value="friday">Every Friday</SelectItem>
                <SelectItem value="saturday">Every Saturday</SelectItem>
                <SelectItem value="sunday">Every Sunday</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="monday-biweekly">Every Other Monday</SelectItem>
                <SelectItem value="tuesday-biweekly">Every Other Tuesday</SelectItem>
                <SelectItem value="wednesday-biweekly">Every Other Wednesday</SelectItem>
                <SelectItem value="thursday-biweekly">Every Other Thursday</SelectItem>
                <SelectItem value="friday-biweekly">Every Other Friday</SelectItem>
                <SelectItem value="saturday-biweekly">Every Other Saturday</SelectItem>
                <SelectItem value="sunday-biweekly">Every Other Sunday</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  const renderDriverCell = () => (
    <div className="space-y-2">
      <Select 
        value={currentDelivery.driver_id || ""} 
        onValueChange={(value) => setCurrentDelivery(prev => ({ ...prev, driver_id: value }))}
      >
        <SelectTrigger className="w-full">
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
  );

  const renderItemsField = () => (
    <div className="space-y-2">
      <Input 
        placeholder="Enter delivery items..."
        value={currentDelivery.items || ""}
        onChange={(e) => setCurrentDelivery(prev => ({ ...prev, items: e.target.value }))}
        className="min-h-[40px]"
      />
    </div>
  );

  const renderNoteField = () => (
    <div className="space-y-2">
      <Input 
        placeholder="Enter delivery notes or special instructions..."
        value={currentDelivery.notes || ""}
        onChange={(e) => setCurrentDelivery(prev => ({ ...prev, notes: e.target.value }))}
        className="min-h-[40px]"
      />
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold">Dispatch & Delivery Schedule</h1>
      
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Delivery Management</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Track and manage deliveries, drivers, and order details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="bg-gray-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Schedule Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    {renderScheduleCell()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Add Delivery to Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Customer</Label>
                      {renderClientCell()}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Driver</Label>
                      {renderDriverCell()}
                    </div>

                    <div className="space-y-2">
                      <Label>Items</Label>
                      {renderItemsField()}
                    </div>

                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <Label>Notes</Label>
                      {renderNoteField()}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button 
                      type="button" 
                      onClick={handleAddToUnscheduled}
                      variant="outline"
                    >
                      Add to Unscheduled
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddDelivery}
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Current Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {deliverySchedule.items.length > 0 && (
                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-green-700">
                      {deliverySchedule.schedule_type === "one-time" 
                        ? deliverySchedule.delivery_date 
                          ? `Scheduled for ${format(deliverySchedule.delivery_date, "MMMM d, yyyy")}` 
                          : "One-time Delivery (select date above)"
                        : deliverySchedule.recurring_day
                          ? `${deliverySchedule.schedule_type === "recurring" ? "Weekly" : "Bi-weekly"} on ${deliverySchedule.recurring_day.split('-')[0].charAt(0).toUpperCase() + deliverySchedule.recurring_day.split('-')[0].slice(1)}s`
                          : `${deliverySchedule.schedule_type === "recurring" ? "Weekly" : "Bi-weekly"} Delivery (select day above)`
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">Customer</TableHead>
                            <TableHead className="text-center">Driver</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-center">Notes</TableHead>
                            <TableHead className="text-center">Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deliverySchedule.items.map((item, index) => {
                            const customer = customers.find(c => c.id === item.customer_id);
                            const driver = drivers.find(d => d.id === item.driver_id);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{customer?.name || "Unknown"}</TableCell>
                                <TableCell>{driver?.name || "Not assigned"}</TableCell>
                                <TableCell>{item.items || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{item.notes || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{customer?.address || "-"}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveDelivery(index)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {deliverySchedule.unscheduled_items.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-amber-700">Unscheduled Deliveries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center">Customer</TableHead>
                            <TableHead className="text-center">Driver</TableHead>
                            <TableHead className="text-center">Items</TableHead>
                            <TableHead className="text-center">Notes</TableHead>
                            <TableHead className="text-center">Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deliverySchedule.unscheduled_items.map((item, index) => {
                            const customer = customers.find(c => c.id === item.customer_id);
                            const driver = drivers.find(d => d.id === item.driver_id);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{customer?.name || "Unknown"}</TableCell>
                                <TableCell>{driver?.name || "Not assigned"}</TableCell>
                                <TableCell>{item.items || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{item.notes || "-"}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{customer?.address || "-"}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveUnscheduledDelivery(index)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <BaseOrderActions 
                onSave={handleSave}
                onSubmit={handleSubmit}
                archiveLink="/dispatch-archive"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                submitLabel="Submit Schedule"
                archiveLabel="View All Schedules"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
