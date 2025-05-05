import React, { useState, useEffect } from 'react';
import { format, parse, isValid, isBefore, isAfter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, Calendar, CheckCircle, Clock, Loader2, RefreshCw,
  Search, User, X, Plus, ArrowRight, CalendarDays
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeliveryStop, Customer } from './stops/types';

interface RecurringOrderSchedulerProps {
  scheduleDate: Date;
  onAddStops: (stops: DeliveryStop[]) => void;
  existingCustomerIds?: string[];
  selectedRecurringOrder?: string | null;
  onSave?: () => void;
  onCancel?: () => void;
  customers?: Customer[];
}

export const RecurringOrderScheduler: React.FC<RecurringOrderSchedulerProps> = ({
  scheduleDate,
  onAddStops,
  existingCustomerIds = [],
  selectedRecurringOrder = null,
  onSave,
  onCancel,
  customers = []
}) => {
  const [recurringOrders, setRecurringOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  
  const dayOfWeek = format(scheduleDate, 'EEEE').toLowerCase();
  const formattedDate = format(scheduleDate, 'yyyy-MM-dd');
  
  useEffect(() => {
    fetchRecurringOrders();
  }, [scheduleDate, selectedRecurringOrder]);
  
  const fetchRecurringOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If a specific recurring order ID is provided, fetch just that one
      if (selectedRecurringOrder) {
        const { data, error } = await supabase
          .from('recurring_orders')
          .select(`
            *,
            customer:customer_id (
              id, name, address, phone, email, type, 
              street_address, city, state, zip_code
            )
          `)
          .eq('id', selectedRecurringOrder)
          .single();
          
        if (error) throw error;
        
        setRecurringOrders(data ? [data] : []);
        // Auto-select this order
        if (data) {
          setSelectedOrders([data.id]);
        }
      } else {
        // Otherwise, fetch all orders that match this day of week
        const { data, error } = await supabase
          .from('recurring_orders')
          .select(`
            *,
            customer:customer_id (
              id, name, address, phone, email, type, 
              street_address, city, state, zip_code
            )
          `)
          .eq('preferred_day', dayOfWeek)
          .eq('active_status', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        console.log(`Found ${data?.length || 0} recurring orders for ${dayOfWeek}`);
        
        // Filter based on frequency rules - e.g., biweekly orders only happen every other week
        const filteredOrders = (data || []).filter(order => {
          if (!order.frequency || order.frequency.toLowerCase() === 'weekly') {
            return true; // Weekly orders always apply
          }
          
          if (order.frequency.toLowerCase() === 'biweekly') {
            // For biweekly, use creation date to determine if this is the right week
            const creationDate = new Date(order.created_at);
            const weeksDiff = Math.floor(
              (scheduleDate.getTime() - creationDate.getTime()) / 
              (7 * 24 * 60 * 60 * 1000)
            );
            return weeksDiff % 2 === 0;
          }
          
          if (order.frequency.toLowerCase() === 'monthly') {
            // For monthly, check if this is the first occurrence of this day in the month
            const currentMonth = scheduleDate.getMonth();
            const firstOfMonth = new Date(scheduleDate.getFullYear(), currentMonth, 1);
            let firstOccurrenceDate = firstOfMonth;
            
            // Find first occurrence of this day in the month
            while (
              firstOccurrenceDate.getMonth() === currentMonth && 
              format(firstOccurrenceDate, 'EEEE').toLowerCase() !== dayOfWeek
            ) {
              firstOccurrenceDate.setDate(firstOccurrenceDate.getDate() + 1);
            }
            
            // Check if current date is the first occurrence
            return (
              scheduleDate.getDate() === firstOccurrenceDate.getDate() &&
              scheduleDate.getMonth() === firstOccurrenceDate.getMonth()
            );
          }
          
          return true; // Default to including the order
        });
        
        console.log(`Filtered to ${filteredOrders.length} orders based on frequency rules`);
        setRecurringOrders(filteredOrders);
      }
    } catch (error: any) {
      console.error('Error fetching recurring orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };
  
  const handleAddSelectedOrders = () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one recurring order to add.",
        variant: "default"
      });
      return;
    }
    
    // Convert selected recurring orders to delivery stops
    const stopsToAdd: DeliveryStop[] = selectedOrders
      .map(orderId => {
        const recurringOrder = recurringOrders.find(order => order.id === orderId);
        if (!recurringOrder || !recurringOrder.customer) return null;
        
        const stop: DeliveryStop = {
          stop_number: 0, // Will be assigned by the parent component
          customer_id: recurringOrder.customer.id,
          customer_name: recurringOrder.customer.name,
          customer_address: recurringOrder.customer.address || constructAddress(recurringOrder.customer),
          customer_phone: recurringOrder.customer.phone || '',
          driver_id: null,
          items: recurringOrder.items || '',
          notes: `Recurring ${recurringOrder.frequency} order`,
          is_recurring: true,
          recurring_id: recurringOrder.id,
          master_schedule_id: '',
          scheduling_status: 'scheduled'
        };
        
        return stop;
      })
      .filter(Boolean) as DeliveryStop[];
    
    // Call the callback to add these stops
    if (stopsToAdd.length > 0) {
      onAddStops(stopsToAdd);
      
      // If in modal mode, call onSave
      if (onSave) {
        onSave();
      }
      
      // Clear selection unless in single-selection mode
      if (!selectedRecurringOrder) {
        setSelectedOrders([]);
      }
    }
  };
  
  const handleSyncRecurringOrders = async () => {
    try {
      setSyncingOrders(true);
      
      // Call the forceSyncForDate function in the recurringOrderUtils.ts via RPC
      const { data, error } = await supabase.rpc('sync_recurring_orders_for_date', {
        date_str: formattedDate
      });
      
      if (error) throw error;
      
      console.log('Sync result:', data);
      
      toast({
        title: "Sync Complete",
        description: `Added ${data.stops_created || 0} recurring stops to schedule.`,
        variant: "default"
      });
      
      // Refresh the list after syncing
      fetchRecurringOrders();
      
    } catch (error: any) {
      console.error('Error syncing recurring orders:', error);
      toast({
        title: "Error",
        description: `Failed to sync recurring orders: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSyncingOrders(false);
    }
  };
  
  const constructAddress = (customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  
  // Filter orders based on search term
  const filteredOrders = recurringOrders.filter(order => {
    if (!searchTerm) return true;
    
    const searchFields = [
      order.customer?.name,
      order.customer?.address,
      order.customer?.phone,
      order.customer?.email,
      order.frequency,
      order.preferred_day,
      order.items
    ].filter(Boolean).map(field => field.toLowerCase());
    
    return searchFields.some(field => field.includes(searchTerm));
  });
  
  // Further filter to remove orders that already have a stop for this customer
  const availableOrders = filteredOrders.filter(order => {
    // If existingCustomerIds is provided and not empty, filter out customers already in the schedule
    if (existingCustomerIds && existingCustomerIds.length > 0) {
      return !existingCustomerIds.includes(order.customer?.id);
    }
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <CardTitle className="text-lg">
            Recurring Orders - {format(scheduleDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRecurringOrders}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {!selectedRecurringOrder && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncRecurringOrders}
                disabled={syncingOrders}
              >
                <Clock className="h-4 w-4 mr-2" />
                {syncingOrders ? 'Syncing...' : 'Sync Orders'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!selectedRecurringOrder && (
          <div className="mb-4 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recurring orders..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : availableOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="mb-2">
              {searchTerm 
                ? "No matching recurring orders found" 
                : filteredOrders.length !== availableOrders.length
                  ? "All matching customers are already in the schedule"
                  : `No recurring orders found for ${format(scheduleDate, 'EEEE')}`
              }
            </p>
            <p className="text-sm text-muted-foreground/70">
              {searchTerm 
                ? "Try adjusting your search" 
                : "Create recurring orders to have them automatically appear here"
              }
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {availableOrders.map(order => (
                  <div
                    key={order.id}
                    className={`border rounded-md p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedOrders.includes(order.id) ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectOrder(order.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">
                        {order.customer?.name || 'No Customer'}
                      </div>
                      <Badge>{order.frequency}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <User className="h-3.5 w-3.5 mr-1" />
                        <span>{order.customer?.type || 'Customer'}</span>
                      </div>
                      
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{order.preferred_day}</span>
                      </div>
                      
                      {order.preferred_time && (
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>{order.preferred_time}</span>
                        </div>
                      )}
                      
                      {order.customer?.address && (
                        <div className="flex items-center text-muted-foreground col-span-2 truncate">
                          <span className="truncate">{order.customer.address}</span>
                        </div>
                      )}
                      
                      {order.items && (
                        <div className="flex items-center text-muted-foreground col-span-2 truncate">
                          <span className="truncate">Items: {order.items}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="mt-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedOrders.length > 0 
                  ? `${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''} selected` 
                  : `${availableOrders.length} order${availableOrders.length > 1 ? 's' : ''} available`}
              </div>
              
              <div className="flex gap-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                
                <Button 
                  onClick={handleAddSelectedOrders}
                  disabled={selectedOrders.length === 0}
                  className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Selected Orders
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
