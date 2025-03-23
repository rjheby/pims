import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  X, 
  Plus, 
  Loader2, 
  RefreshCw, 
  MoreVertical, 
  CalendarDays,
  Edit,
  Trash2,
  Copy,
  AlertTriangle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

import { RecurringOrder, calculateNextOccurrences } from "../utils/recurringOrderUtils";

interface RecurringOrderManagerProps {
  customerId?: string;
}

export function RecurringOrderManager({ customerId }: RecurringOrderManagerProps) {
  const [orders, setOrders] = useState<RecurringOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditOrder, setCurrentEditOrder] = useState<RecurringOrder | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state for creating/editing
  const [formState, setFormState] = useState({
    customerId: "",
    frequency: "weekly",
    preferredDay: "monday",
    preferredTime: "",
    notes: ""
  });

  // Load recurring orders
  useEffect(() => {
    fetchRecurringOrders();
    fetchCustomers();
  }, [customerId]);

  const fetchRecurringOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('recurring_orders')
        .select(`
          *,
          customer:customer_id (
            id, name, address, phone, email
          )
        `)
        .order('created_at', { ascending: false });
      
      // Filter by customer if specified
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched recurring orders:', data);
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching recurring orders:', error);
      setError(handleSupabaseError(error));
      toast({
        title: 'Error',
        description: `Failed to load recurring orders: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email')
        .order('name');
      
      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Don't show a toast for this, it's not critical
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCreateOrder = async () => {
    try {
      // Validate form
      if (!formState.customerId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a customer.',
          variant: 'destructive',
        });
        return;
      }
      
      // Create the recurring order
      const { data, error } = await supabase
        .from('recurring_orders')
        .insert({
          customer_id: formState.customerId,
          frequency: formState.frequency,
          preferred_day: formState.preferredDay,
          preferred_time: formState.preferredTime,
          active_status: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Recurring order created successfully.',
      });
      
      // Reset form and close dialog
      setFormState({
        customerId: "",
        frequency: "weekly",
        preferredDay: "monday",
        preferredTime: "",
        notes: ""
      });
      setIsCreateDialogOpen(false);
      
      // Refresh the orders list
      fetchRecurringOrders();
      
    } catch (error) {
      console.error('Error creating recurring order:', error);
      toast({
        title: 'Error',
        description: `Failed to create recurring order: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateOrder = async () => {
    if (!currentEditOrder) return;
    
    try {
      // Validate form
      if (!formState.customerId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a customer.',
          variant: 'destructive',
        });
        return;
      }
      
      // Update the recurring order
      const { error } = await supabase
        .from('recurring_orders')
        .update({
          customer_id: formState.customerId,
          frequency: formState.frequency,
          preferred_day: formState.preferredDay,
          preferred_time: formState.preferredTime
        })
        .eq('id', currentEditOrder.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Recurring order updated successfully.',
      });
      
      // Reset form and close dialog
      setFormState({
        customerId: "",
        frequency: "weekly",
        preferredDay: "monday",
        preferredTime: "",
        notes: ""
      });
      setIsEditDialogOpen(false);
      setCurrentEditOrder(null);
      
      // Refresh the orders list
      fetchRecurringOrders();
      
    } catch (error) {
      console.error('Error updating recurring order:', error);
      toast({
        title: 'Error',
        description: `Failed to update recurring order: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleEditOrder = (order: RecurringOrder) => {
    setCurrentEditOrder(order);
    setFormState({
      customerId: order.customer_id,
      frequency: order.frequency,
      preferredDay: order.preferred_day,
      preferredTime: order.preferred_time || "",
      notes: ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      // Delete the recurring order
      const { error } = await supabase
        .from('recurring_orders')
        .delete()
        .eq('id', orderToDelete);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Recurring order deleted successfully.',
      });
      
      // Reset state and close dialog
      setOrderToDelete(null);
      setDeleteDialogOpen(false);
      
      // Refresh the orders list
      fetchRecurringOrders();
      
    } catch (error) {
      console.error('Error deleting recurring order:', error);
      toast({
        title: 'Error',
        description: `Failed to delete recurring order: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateOrder = async (order: RecurringOrder) => {
    try {
      // Create a duplicate of the recurring order
      const { data, error } = await supabase
        .from('recurring_orders')
        .insert({
          customer_id: order.customer_id,
          frequency: order.frequency,
          preferred_day: order.preferred_day,
          preferred_time: order.preferred_time,
          active_status: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Recurring order duplicated successfully.',
      });
      
      // Refresh the orders list
      fetchRecurringOrders();
      
    } catch (error) {
      console.error('Error duplicating recurring order:', error);
      toast({
        title: 'Error',
        description: `Failed to duplicate recurring order: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (order: RecurringOrder) => {
    try {
      // Toggle the active status
      const { error } = await supabase
        .from('recurring_orders')
        .update({
          active_status: !order.active_status
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Recurring order ${order.active_status ? 'deactivated' : 'activated'} successfully.`,
      });
      
      // Refresh the orders list
      fetchRecurringOrders();
      
    } catch (error) {
      console.error('Error toggling order status:', error);
      toast({
        title: 'Error',
        description: `Failed to update order status: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    fetchRecurringOrders();
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchLower)) ||
      (order.frequency && order.frequency.toLowerCase().includes(searchLower)) ||
      (order.preferred_day && order.preferred_day.toLowerCase().includes(searchLower))
    );
  });

  // Get the preferred day display text
  const getPreferredDayDisplay = (day: string) => {
    // Check if it's a day of week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (daysOfWeek.includes(day.toLowerCase())) {
      return day.charAt(0).toUpperCase() + day.slice(1);
    }
    
    // Check if it's a day of month (number)
    if (/^\d+$/.test(day)) {
      const num = parseInt(day, 10);
      return `${num}${getOrdinalSuffix(num)} of month`;
    }
    
    // Otherwise, it's likely a pattern like "first monday"
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Helper to get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Calculate the next few occurrences
  const getNextOccurrences = (order: RecurringOrder, count: number = 3) => {
    try {
      const startDate = new Date();
      return calculateNextOccurrences(
        startDate,
        order.frequency,
        order.preferred_day,
        count
      );
    } catch (error) {
      console.error('Error calculating next occurrences:', error);
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recurring orders..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Recurring Order
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Recurring Order</DialogTitle>
              <DialogDescription>
                Set up a recurring delivery schedule for a customer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formState.customerId}
                  onValueChange={(value) => setFormState({...formState, customerId: value})}
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
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formState.frequency}
                  onValueChange={(value) => setFormState({...formState, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Day</Label>
                <RadioGroup
                  value={formState.preferredDay}
                  onValueChange={(value) => setFormState({...formState, preferredDay: value})}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monday" id="monday" />
                    <Label htmlFor="monday">Monday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tuesday" id="tuesday" />
                    <Label htmlFor="tuesday">Tuesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wednesday" id="wednesday" />
                    <Label htmlFor="wednesday">Wednesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thursday" id="thursday" />
                    <Label htmlFor="thursday">Thursday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friday" id="friday" />
                    <Label htmlFor="friday">Friday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saturday" id="saturday" />
                    <Label htmlFor="saturday">Saturday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sunday" id="sunday" />
                    <Label htmlFor="sunday">Sunday</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time (Optional)</Label>
                <Input
                  id="preferredTime"
                  value={formState.preferredTime}
                  onChange={(e) => setFormState({...formState, preferredTime: e.target.value})}
                  placeholder="e.g., Morning, Afternoon, 2 PM"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formState.notes}
                  onChange={(e) => setFormState({...formState, notes: e.target.value})}
                  placeholder="Any special instructions for this recurring order"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrder}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                Create Recurring Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Recurring Order</DialogTitle>
              <DialogDescription>
                Update the recurring delivery schedule.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select
                  value={formState.customerId}
                  onValueChange={(value) => setFormState({...formState, customerId: value})}
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
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formState.frequency}
                  onValueChange={(value) => setFormState({...formState, frequency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Day</Label>
                <RadioGroup
                  value={formState.preferredDay}
                  onValueChange={(value) => setFormState({...formState, preferredDay: value})}
                  className="flex flex-wrap gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monday" id="edit-monday" />
                    <Label htmlFor="edit-monday">Monday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tuesday" id="edit-tuesday" />
                    <Label htmlFor="edit-tuesday">Tuesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wednesday" id="edit-wednesday" />
                    <Label htmlFor="edit-wednesday">Wednesday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="thursday" id="edit-thursday" />
                    <Label htmlFor="edit-thursday">Thursday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friday" id="edit-friday" />
                    <Label htmlFor="edit-friday">Friday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="saturday" id="edit-saturday" />
                    <Label htmlFor="edit-saturday">Saturday</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sunday" id="edit-sunday" />
                    <Label htmlFor="edit-sunday">Sunday</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time (Optional)</Label>
                <Input
                  id="edit-preferredTime"
                  value={formState.preferredTime}
                  onChange={(e) => setFormState({...formState, preferredTime: e.target.value})}
                  placeholder="e.g., Morning, Afternoon, 2 PM"
                />
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Editing this recurring order will affect all future occurrences.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setCurrentEditOrder(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateOrder}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                Update Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Recurring Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this recurring order? This action cannot be undone,
                and all future occurrences will be canceled.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrderToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error message if loading failed */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredOrders.length} recurring orders
          {searchTerm && <span> (search: "{searchTerm}")</span>}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading recurring orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        // Empty state
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No recurring orders found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm 
                ? "No recurring orders match your search criteria."
                : "There are no recurring orders set up yet. Create your first recurring order to get started."}
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Recurring Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Grid of recurring order cards
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <RecurringOrderCard 
              key={order.id}
              order={order}
              onEdit={() => handleEditOrder(order)}
              onDelete={() => {
                setOrderToDelete(order.id);
                setDeleteDialogOpen(true);
              }}
              onDuplicate={() => handleDuplicateOrder(order)}
              onToggleStatus={() => handleToggleStatus(order)}
              nextOccurrences={getNextOccurrences(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RecurringOrderCardProps {
  order: RecurringOrder;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  nextOccurrences: Date[];
}

function RecurringOrderCard({ 
  order, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleStatus,
  nextOccurrences 
}: RecurringOrderCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-muted/40 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-lg">
                {order.customer?.name || 'Unknown Customer'}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {order.frequency.charAt(0).toUpperCase() + order.frequency.slice(1)}
                {' • '}
                {order.preferred_day.charAt(0).toUpperCase() + order.preferred_day.slice(1)}
                {order.preferred_time && ` • ${order.preferred_time}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={
                order.active_status 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }>
                {order.active_status ? 'Active' : 'Inactive'}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onToggleStatus}>
                    {order.active_status ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reactivate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Next Occurrences:</h4>
            {nextOccurrences.length > 0 ? (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {nextOccurrences.map((date, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {format(date, 'EEE')}
                    </Badge>
                    {format(date, 'MMM d, yyyy')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Unable to calculate next occurrences
              </p>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600"
              onClick={onEdit}
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit Order
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
