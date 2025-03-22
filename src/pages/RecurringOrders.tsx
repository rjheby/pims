
import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { RecurringOrdersTable } from "./dispatch/components/RecurringOrdersTable";

interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  preferred_time?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export default function RecurringOrders() {
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<RecurringOrder> | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("recurring_orders")
        .select(`
          *,
          customer:customer_id (
            id,
            name,
            address,
            phone,
            email
          )
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching recurring orders:", error);
      toast({
        title: "Error",
        description: "Failed to load recurring orders: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, address, phone, email")
        .order("name");
        
      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    }
  };

  const handleAddOrder = () => {
    setCurrentOrder({ 
      frequency: "weekly",
      preferred_day: "monday"
    });
    setOrderDialogOpen(true);
  };

  const handleEditOrder = (order: RecurringOrder) => {
    setCurrentOrder({ 
      id: order.id,
      customer_id: order.customer_id,
      frequency: order.frequency,
      preferred_day: order.preferred_day,
      preferred_time: order.preferred_time
    });
    setOrderDialogOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring order?")) return;
    
    try {
      const { error } = await supabase
        .from("recurring_orders")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Recurring order deleted successfully"
      });
      
      fetchOrders();
    } catch (error: any) {
      console.error("Error deleting recurring order:", error);
      toast({
        title: "Error",
        description: "Failed to delete recurring order",
        variant: "destructive"
      });
    }
  };

  const handleSaveOrder = async () => {
    if (!currentOrder || !currentOrder.customer_id || !currentOrder.frequency) {
      toast({
        title: "Error",
        description: "Customer and frequency are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentOrder.id) {
        // Update existing order
        const { error } = await supabase
          .from("recurring_orders")
          .update({
            customer_id: currentOrder.customer_id,
            frequency: currentOrder.frequency,
            preferred_day: currentOrder.preferred_day,
            preferred_time: currentOrder.preferred_time,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentOrder.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Recurring order updated successfully"
        });
      } else {
        // Insert new order
        const { error } = await supabase
          .from("recurring_orders")
          .insert({
            customer_id: currentOrder.customer_id,
            frequency: currentOrder.frequency,
            preferred_day: currentOrder.preferred_day,
            preferred_time: currentOrder.preferred_time,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Recurring order added successfully"
        });
      }
      
      setOrderDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error("Error saving recurring order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save recurring order",
        variant: "destructive"
      });
    }
  };

  const frequencyOptions = [
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const dayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const timeOptions = [
    { value: "morning", label: "Morning (8AM-12PM)" },
    { value: "afternoon", label: "Afternoon (12PM-4PM)" },
    { value: "evening", label: "Evening (4PM-8PM)" },
  ];

  const formatFrequency = (freq: string): string => {
    return frequencyOptions.find(f => f.value === freq)?.label || freq;
  };

  const formatDay = (day?: string): string => {
    return day ? (dayOptions.find(d => d.value === day)?.label || day) : "Any Day";
  };

  const formatTime = (time?: string): string => {
    return time ? (timeOptions.find(t => t.value === time)?.label || time) : "Any Time";
  };

  const filteredOrders = orders.filter(order => 
    order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    formatFrequency(order.frequency).toLowerCase().includes(search.toLowerCase()) ||
    (order.preferred_day && formatDay(order.preferred_day).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Recurring Orders</h1>
            <p className="text-muted-foreground">Manage recurring delivery schedules</p>
          </div>
          <Button onClick={handleAddOrder}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Recurring Orders</CardTitle>
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <RecurringOrdersTable
                orders={orders}
                onEditOrder={handleEditOrder}
                onDeleteOrder={handleDeleteOrder}
                formatFrequency={formatFrequency}
                formatDay={formatDay}
                formatTime={formatTime}
                filteredOrders={filteredOrders}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className={isMobile ? "w-[95%] sm:max-w-md" : "sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>
              {currentOrder?.id ? "Edit Recurring Order" : "Add New Recurring Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={currentOrder?.customer_id || ""}
                onValueChange={(value) => setCurrentOrder(prev => prev ? { ...prev, customer_id: value } : null)}
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
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={currentOrder?.frequency || "weekly"}
                onValueChange={(value) => setCurrentOrder(prev => prev ? { ...prev, frequency: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_day">Preferred Day</Label>
              <Select
                value={currentOrder?.preferred_day || ""}
                onValueChange={(value) => setCurrentOrder(prev => prev ? { ...prev, preferred_day: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred day" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferred_time">Preferred Time</Label>
              <Select
                value={currentOrder?.preferred_time || ""}
                onValueChange={(value) => setCurrentOrder(prev => prev ? { ...prev, preferred_time: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrder}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
