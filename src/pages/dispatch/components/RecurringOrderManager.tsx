import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, CalendarDays, MoreHorizontal, Pencil, Trash2, 
  CheckCircle, XCircle, Clock, User, Repeat, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RecurringOrderForm } from "./RecurringOrderForm";
import { RecurringOrderDetails } from "./RecurringOrderDetails";
import { calculateNextOccurrences, syncAllRecurringOrders } from "../utils/recurringOrderUtils";

export function RecurringOrderManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [recurringOrders, setRecurringOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchRecurringOrders();
    fetchCustomers();
  }, []);

  const fetchRecurringOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recurring_orders')
        .select(`
          *,
          customer:customer_id (
            id, name, address, phone, email
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Fetched recurring orders:", data);
      setRecurringOrders(data || []);
    } catch (error) {
      console.error('Error fetching recurring orders:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring orders",
        variant: "destructive"
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
    }
  };

  const handleAddRecurringOrder = async (formData: any) => {
    try {
      // Create the recurring order
      const { data: newOrder, error } = await supabase
        .from('recurring_orders')
        .insert({
          customer_id: formData.customer_id,
          frequency: formData.frequency,
          preferred_day: formData.preferred_day,
          preferred_time: formData.preferred_time,
          items: formData.items,
          active_status: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Recurring order created successfully",
      });
      
      setShowAddForm(false);
      fetchRecurringOrders();
      
      // After creating a recurring order, sync it with dispatch schedules
      if (newOrder) {
        syncAllRecurringOrders().then(result => {
          if (result.success) {
            console.log(`Synced ${result.processed} recurring orders`);
          } else {
            console.error('Failed to sync recurring orders:', result.error);
          }
        });
      }
    } catch (error: any) {
      console.error('Error creating recurring order:', error);
      toast({
        title: "Error",
        description: `Failed to create recurring order: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEditOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailsDialog(true);
  };

  const handleDeleteOrder = (order: any) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      // First delete any associations in the join table
      const { error: joinError } = await supabase
        .from('recurring_order_schedules')
        .delete()
        .eq('recurring_order_id', selectedOrder.id);
        
      if (joinError) {
        console.error("Error deleting order associations:", joinError);
      }
      
      // Then delete the recurring order
      const { error } = await supabase
        .from('recurring_orders')
        .delete()
        .eq('id', selectedOrder.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Recurring order deleted successfully",
      });
      
      // Refresh the list
      fetchRecurringOrders();
      
    } catch (error: any) {
      console.error('Error deleting recurring order:', error);
      toast({
        title: "Error",
        description: `Failed to delete recurring order: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleToggleStatus = async (order: any) => {
    try {
      const newStatus = !order.active_status;
      
      const { error } = await supabase
        .from('recurring_orders')
        .update({ active_status: newStatus })
        .eq('id', order.id);
        
      if (error) throw error;
      
      // Update local state
      setRecurringOrders(recurringOrders.map(o => 
        o.id === order.id ? { ...o, active_status: newStatus } : o
      ));
      
      toast({
        title: "Success",
        description: `Recurring order ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      // If activating, sync the order
      if (newStatus) {
        syncAllRecurringOrders().then(result => {
          if (result.success) {
            console.log(`Synced ${result.processed} recurring orders`);
          } else {
            console.error('Failed to sync recurring orders:', result.error);
          }
        });
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleSyncOrders = async () => {
    try {
      setSyncing(true);
      
      const result = await syncAllRecurringOrders();
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Synchronized ${result.processed} recurring orders with dispatch schedules`,
        });
      } else {
        toast({
          title: "Warning",
          description: `Synchronization completed with errors: ${result.error}`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error syncing orders:', error);
      toast({
        title: "Error",
        description: `Failed to sync orders: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getNextDeliveryDate = (order: any) => {
    if (!order) return "N/A";
    
    try {
      const nextOccurrences = calculateNextOccurrences(
        new Date(), 
        order.frequency, 
        order.preferred_day,
        1
      );
      
      if (nextOccurrences.length > 0) {
        return format(nextOccurrences[0], "EEEE, MMMM d, yyyy");
      }
      
      return "Could not calculate";
    } catch (error) {
      console.error('Error calculating next delivery:', error);
      return "Error calculating";
    }
  };

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'weekly':
        return "bg-blue-100 text-blue-800";
      case 'bi-weekly':
        return "bg-purple-100 text-purple-800";
      case 'monthly':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDetailsDialogClosed = () => {
    setShowDetailsDialog(false);
    fetchRecurringOrders();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recurring Orders</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleSyncOrders}
            variant="outline"
            disabled={syncing}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Orders'}
          </Button>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Recurring Order
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recurringOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <CalendarDays className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Recurring Orders</h3>
            <p className="text-gray-500 mb-4">
              Create recurring delivery schedules for your customers
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Recurring Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurringOrders.map((order) => (
            <Card key={order.id} className={!order.active_status ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {order.customer?.name || "Unknown Customer"}
                      {!order.active_status && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {order.customer?.address || "No address"}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditOrder(order.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(order)}>
                        {order.active_status ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteOrder(order)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Repeat className="h-4 w-4 text-gray-500" />
                    <span>
                      <Badge className={getFrequencyBadgeColor(order.frequency)}>
                        {order.frequency.charAt(0).toUpperCase() + order.frequency.slice(1)}
                      </Badge>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span>{order.preferred_day}</span>
                  </div>
                  
                  {order.preferred_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{order.preferred_time}</span>
                    </div>
                  )}
                  
                  {order.customer?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{order.customer.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Next delivery:</span>
                    <span className="font-medium">{getNextDeliveryDate(order)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Recurring Order Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Recurring Order</DialogTitle>
            <DialogDescription>
              Set up a recurring delivery schedule for a customer
            </DialogDescription>
          </DialogHeader>
          
          <RecurringOrderForm 
            customers={customers} 
            onSubmit={handleAddRecurringOrder}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Order Details Dialog */}
      {selectedOrderId && (
        <Dialog open={showDetailsDialog} onOpenChange={handleDetailsDialogClosed}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Recurring Order Details</DialogTitle>
              <DialogDescription>
                View and edit recurring order settings
              </DialogDescription>
            </DialogHeader>
            
            <RecurringOrderDetails 
              orderId={selectedOrderId}
              customers={customers}
              onSaved={() => {
                setShowDetailsDialog(false);
                fetchRecurringOrders();
              }}
              onCancel={() => setShowDetailsDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recurring order for {selectedOrder?.customer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteOrder}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
