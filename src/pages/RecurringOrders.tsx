
import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, Search, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase, fetchWithFallback, handleSupabaseError } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { RecurringOrdersTable } from "./dispatch/components/RecurringOrdersTable";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  active_status?: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export default function RecurringOrders() {
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<RecurringOrder> | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      // Try using the fetchWithFallback helper for WebSocket connection issues
      const { data, error } = await fetchWithFallback(
        "recurring_orders",
        (query) => query
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
          .order("created_at", { ascending: false })
      );
        
      if (error) throw error;
      
      console.log("Fetched recurring orders:", data);
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching recurring orders:", error);
      setLoadError(handleSupabaseError(error));
      toast({
        title: "Error",
        description: "Failed to load recurring orders: " + handleSupabaseError(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await fetchWithFallback(
        "customers",
        (query) => query
          .select("id, name, address, phone, email")
          .order("name")
      );
        
      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers: " + handleSupabaseError(error),
        variant: "destructive"
      });
    }
  };

  const handleAddOrder = () => {
    setCurrentOrder({ 
      frequency: "weekly",
      preferred_day: "monday",
      active_status: true
    });
    setOrderDialogOpen(true);
  };

  const handleEditOrder = (order: RecurringOrder) => {
    setCurrentOrder({ 
      id: order.id,
      customer_id: order.customer_id,
      frequency: order.frequency,
      preferred_day: order.preferred_day,
      preferred_time: order.preferred_time,
      active_status: order.active_status
    });
    setOrderDialogOpen(true);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      // Delete join table entries first
      const { error: joinError } = await supabase
        .from("recurring_order_schedules")
        .delete()
        .eq("recurring_order_id", id);
        
      if (joinError) {
        console.warn("Error deleting join records:", joinError);
        // Continue with deleting the main record anyway
      }
      
      // Delete main recurring order
      const { error } = await supabase
        .from("recurring_orders")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Recurring order deleted successfully"
      });
      
      // Update local state
      setOrders(orders.filter(order => order.id !== id));
    } catch (error: any) {
      console.error("Error deleting recurring order:", error);
      toast({
        title: "Error",
        description: "Failed to delete recurring order: " + handleSupabaseError(error),
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
      setSaving(true);
      
      if (currentOrder.id) {
        // Update existing order
        const { data, error } = await supabase
          .from("recurring_orders")
          .update({
            customer_id: currentOrder.customer_id,
            frequency: currentOrder.frequency,
            preferred_day: currentOrder.preferred_day,
            preferred_time: currentOrder.preferred_time,
            active_status: currentOrder.active_status,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentOrder.id)
          .select()
          .single();

        if (error) throw error;
        
        // Update local state
        setOrders(orders.map(order => 
          order.id === currentOrder.id ? { ...order, ...data } : order
        ));
        
        toast({
          title: "Success",
          description: "Recurring order updated successfully"
        });
      } else {
        // Insert new order
        const { data, error } = await supabase
          .from("recurring_orders")
          .insert({
            customer_id: currentOrder.customer_id,
            frequency: currentOrder.frequency,
            preferred_day: currentOrder.preferred_day,
            preferred_time: currentOrder.preferred_time,
            active_status: currentOrder.active_status
          })
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
          .single();

        if (error) throw error;
        
        // Update local state
        setOrders([data, ...orders]);
        
        toast({
          title: "Success",
          description: "Recurring order added successfully"
        });
      }
      
      setOrderDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving recurring order:", error);
      toast({
        title: "Error",
        description: handleSupabaseError(error) || "Failed to save recurring order",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  const handleRetry = () => {
    fetchOrders();
  };

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

        {loadError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
              <div className="flex flex-col justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Loading recurring orders...</p>
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
            
            <div className="flex items-center justify-between space-y-0 pt-2">
              <Label htmlFor="active_status">Active Status</Label>
              <Switch
                id="active_status"
                checked={currentOrder?.active_status !== false}
                onCheckedChange={(checked) => 
                  setCurrentOrder(prev => prev ? { ...prev, active_status: checked } : null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrder} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
