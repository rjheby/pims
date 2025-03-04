
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
import { Calendar as CalendarIcon, Loader2, Archive, Trash, SendHorizontal } from "lucide-react";
import { Customer } from "./customers/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";

interface DeliverySchedule {
  id?: string;
  customer_id: string | null;
  schedule_type: "one-time" | "recurring" | "bi-weekly";
  recurring_day: string | null;
  delivery_date: Date | null;
  notes: string | null;
}

export default function DispatchDelivery() {
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule>({
    customer_id: null,
    schedule_type: "one-time",
    recurring_day: null,
    delivery_date: null,
    notes: null,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  }, []);

  // Find the selected customer by ID
  const selectedCustomer = customers.find(c => c.id === deliverySchedule.customer_id);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!deliverySchedule.customer_id) {
        toast({
          title: "Error",
          description: "Please select a customer",
          variant: "destructive"
        });
        return;
      }
      
      // In a real application, you would save to database here
      console.log("Saving delivery schedule:", deliverySchedule);
      
      toast({
        title: "Success",
        description: "Delivery schedule saved successfully"
      });
    } catch (error) {
      console.error("Error saving delivery schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save delivery schedule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (!deliverySchedule.customer_id) {
        toast({
          title: "Error",
          description: "Please select a customer",
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
      
      // In a real application, you would submit to database here
      console.log("Submitting delivery schedule:", deliverySchedule);
      
      toast({
        title: "Success",
        description: "Delivery schedule submitted successfully"
      });
    } catch (error) {
      console.error("Error submitting delivery schedule:", error);
      toast({
        title: "Error",
        description: "Failed to submit delivery schedule",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClientCell = () => (
    <div className="flex items-center space-x-2">
      <Select 
        value={deliverySchedule.customer_id || ""} 
        onValueChange={(value) => setDeliverySchedule(prev => ({ ...prev, customer_id: value }))}
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

  const renderNoteField = () => (
    <div className="space-y-2">
      <Label htmlFor="notes">Delivery Notes</Label>
      <Input 
        id="notes" 
        placeholder="Enter delivery notes or special instructions..."
        value={deliverySchedule.notes || ""}
        onChange={(e) => setDeliverySchedule(prev => ({ ...prev, notes: e.target.value }))}
        className="min-h-[60px]"
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
          ) : isMobile ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  {renderClientCell()}
                </div>
                
                {selectedCustomer && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Phone</label>
                      <div>{selectedCustomer.phone || '-'}</div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Address</label>
                      <div className="text-sm break-words">{selectedCustomer.address || '-'}</div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Delivery Schedule</Label>
                  {renderScheduleCell()}
                </div>
                
                {renderNoteField()}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order</label>
                    <div className="p-2 border rounded">-</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Driver</label>
                    <div className="p-2 border rounded">-</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Items</label>
                    <div className="p-2 border rounded">-</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price</label>
                    <div className="p-2 border rounded">-</div>
                  </div>
                </div>
              </div>
              
              <BaseOrderActions 
                onSave={handleSave}
                onSubmit={handleSubmit}
                archiveLink="/dispatch-archive"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                submitLabel="Submit Schedule"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Delivery Schedule</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">{renderClientCell()}</TableCell>
                      <TableCell>{selectedCustomer?.phone || '-'}</TableCell>
                      <TableCell>{renderScheduleCell()}</TableCell>
                      <TableCell>
                        <Input 
                          placeholder="Delivery notes..."
                          value={deliverySchedule.notes || ""}
                          onChange={(e) => setDeliverySchedule(prev => ({ ...prev, notes: e.target.value }))}
                          className="min-h-[40px] w-full"
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={selectedCustomer?.address || '-'}>
                        {selectedCustomer?.address || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <BaseOrderActions 
                onSave={handleSave}
                onSubmit={handleSubmit}
                archiveLink="/dispatch-archive"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                submitLabel="Submit Schedule"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
