import React from "react";
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle, CalendarDays, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useRecurringOrdersScheduling } from '../hooks/useRecurringOrdersScheduling';
import { parsePreferredTimeToWindow, formatTimeWindow } from '../utils/timeWindowUtils';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forceSyncForDate } from '../utils/recurringOrderUtils';
import { RecurringOrder } from "../components/stops/types";

interface RecurringOrderSchedulerProps {
  scheduleDate: Date;
  onAddStops: (stops: any[]) => void;
  existingCustomerIds?: string[];
}

export function RecurringOrderScheduler({ 
  scheduleDate, 
  onAddStops,
  existingCustomerIds = []
}: RecurringOrderSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("today");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const endDate = new Date(scheduleDate);
  endDate.setDate(endDate.getDate() + 7);

  const { 
    recurringOrders,
    scheduledOccurrences,
    loading: recurringLoading, 
    error,
    fetchRecurringOrders,
    generateOccurrences,
    checkForScheduleConflicts
  } = useRecurringOrdersScheduling(scheduleDate, endDate);

  useEffect(() => {
    console.log(`RecurringOrderScheduler: scheduleDate=${scheduleDate.toISOString()}, endDate=${endDate.toISOString()}`);
    console.log(`RecurringOrderScheduler: existingCustomerIds=${JSON.stringify(existingCustomerIds)}`);
    
    fetchRecurringOrders()
      .then(orders => {
        console.log(`RecurringOrderScheduler: Fetched ${orders.length} recurring orders`);
        if (orders.length > 0) {
          console.log("Generating occurrences with these orders:", orders);
          generateOccurrences(orders, scheduleDate, endDate);
        }
      })
      .catch(err => {
        console.error("Error fetching recurring orders:", err);
        setConnectionError(err.message);
      });
  }, [scheduleDate, endDate, fetchRecurringOrders, generateOccurrences]);

  const currentDateOccurrences = scheduledOccurrences.filter(occurrence => {
    const occurrenceDate = new Date(occurrence.date);
    const scheduleDateObj = new Date(scheduleDate);
    
    const isSameDate = 
      occurrenceDate.getFullYear() === scheduleDateObj.getFullYear() && 
      occurrenceDate.getMonth() === scheduleDateObj.getMonth() && 
      occurrenceDate.getDate() === scheduleDateObj.getDate();
      
    console.log(`Comparing dates: ${occurrenceDate.toDateString()} and ${scheduleDateObj.toDateString()} - match: ${isSameDate}`);
    
    return isSameDate;
  });

  console.log(`RecurringOrderScheduler: Found ${currentDateOccurrences.length} occurrences on ${scheduleDate.toDateString()}`);

  const availableOccurrences = currentDateOccurrences.filter(occurrence => {
    const isAvailable = !existingCustomerIds.includes(occurrence.recurringOrder.customer_id);
    if (!isAvailable) {
      console.log(`Customer ${occurrence.recurringOrder.customer_id} already exists in schedule`);
    }
    return isAvailable;
  });

  console.log(`RecurringOrderScheduler: ${availableOccurrences.length} available occurrences after filtering out existing customers`);

  const getPlanningOccurrences = () => {
    const planEndDate = new Date(scheduleDate);
    planEndDate.setDate(planEndDate.getDate() + 7);
    
    return scheduledOccurrences.filter(occurrence => {
      const occurrenceDate = new Date(occurrence.date);
      return occurrenceDate >= scheduleDate && occurrenceDate <= planEndDate;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const planningOccurrences = getPlanningOccurrences();

  const handleAddAllToSchedule = () => {
    if (availableOccurrences.length === 0) {
      toast({
        title: "No recurring orders",
        description: "There are no available recurring orders for this date",
        variant: "default"
      });
      return;
    }

    setLoading(true);
    
    try {
      const newStops = availableOccurrences.map((occurrence, index) => {
        const order = occurrence.recurringOrder;
        const customer = order.customer;
        
        if (!customer) {
          console.warn(`No customer data for recurring order ${order.id}`);
          return null;
        }
        
        const timeWindow = parsePreferredTimeToWindow(order.preferred_time);
        const formattedTimeWindow = formatTimeWindow(timeWindow);
        
        console.log(`Creating stop for customer ${customer.name} (${customer.id})`);
        console.log(`Using items from recurring order: ${order.items || 'None specified'}`);
        
        return {
          stop_number: existingCustomerIds.length + index + 1,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_address: customer.address || '',
          customer_phone: customer.phone || '',
          items: order.items || '',
          notes: `Recurring ${order.frequency} order - ${formattedTimeWindow}`,
          price: 0,
          is_recurring: true,
          recurring_id: order.id,
          status: 'pending'
        };
      }).filter(Boolean) as any[];
      
      console.log(`RecurringOrderScheduler: Adding ${newStops.length} stops to schedule`);
      console.log('Stop data:', newStops);
      
      onAddStops(newStops);
      
      toast({
        title: "Success",
        description: `Added ${newStops.length} recurring orders to schedule`,
      });
    } catch (error: any) {
      console.error("Error adding recurring orders:", error);
      setConnectionError(error.message);
      toast({
        title: "Error",
        description: "Failed to add recurring orders: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceSyncForDate = async () => {
    if (!scheduleDate) {
      toast({
        title: "Error",
        description: "No schedule date selected",
        variant: "destructive"
      });
      return;
    }
    
    setSyncing(true);
    
    try {
      console.log(`Force syncing recurring orders for date: ${scheduleDate.toISOString()}`);
      
      const result = await forceSyncForDate(scheduleDate);
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synchronized recurring orders. ${result.stopsCreated} stops created.`,
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to synchronize recurring orders",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error syncing recurring orders:", error);
      toast({
        title: "Error",
        description: "Failed to sync recurring orders: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
    fetchRecurringOrders();
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Orders for {format(scheduleDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleForceSyncForDate}
              disabled={syncing}
            >
              <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Force Sync'}
            </Button>
            <Badge variant="outline" className={activeTab === "today" 
              ? "ml-2 bg-primary/10 text-primary" 
              : "ml-2"}>
              {activeTab === "today" 
                ? `${availableOccurrences.length} Available` 
                : `${planningOccurrences.length} Upcoming`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error || connectionError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error || connectionError}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        
        <Tabs defaultValue="today" onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="planning">Next 7 Days</TabsTrigger>
          </TabsList>
        
          <TabsContent value="today">
            {recurringLoading ? (
              <div className="space-y-2">
                {renderSkeletonItems()}
              </div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : availableOccurrences.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No recurring orders available for this date.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {availableOccurrences.map(occurrence => renderOccurrenceItem({
                    ...occurrence,
                    activeTab
                  }))}
                </div>
                
                <div className="pt-2">
                  <Button 
                    onClick={handleAddAllToSchedule}
                    disabled={loading || availableOccurrences.length === 0}
                    className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90"
                  >
                    {loading ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add All to Schedule"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="planning">
            {recurringLoading ? (
              <div className="space-y-2">
                {renderSkeletonItems()}
              </div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : planningOccurrences.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No upcoming recurring orders for the next 7 days.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {planningOccurrences.map(occurrence => renderOccurrenceItem({
                    ...occurrence,
                    activeTab: "planning"
                  }))}
                </div>
                
                <div className="pt-2 text-center text-sm text-muted-foreground">
                  <p>This view shows upcoming recurring orders for planning purposes.</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function renderOccurrenceItem(occurrence: any) {
  const timeWindow = parsePreferredTimeToWindow(occurrence.recurringOrder.preferred_time);
  const formattedTimeWindow = formatTimeWindow(timeWindow);
  
  return (
    <div key={`${occurrence.recurringOrder.id}-${occurrence.date.toISOString()}`} 
         className="flex justify-between items-center p-3 bg-muted/40 rounded-md border border-gray-100 hover:border-primary/20 transition-colors">
      <div>
        <p className="font-medium">{occurrence.recurringOrder.customer?.name}</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize bg-primary/10 text-primary">
              {occurrence.recurringOrder.frequency}
            </Badge>
            {occurrence.recurringOrder.preferred_time && (
              <Badge variant="secondary" className="font-normal">
                {formattedTimeWindow}
              </Badge>
            )}
            {occurrence.recurringOrder.items && (
              <div className="text-sm text-gray-600 line-clamp-2">
                {getItemsLabel(occurrence.recurringOrder)}
              </div>
            )}
          </div>
          {occurrence.activeTab === "planning" && (
            <p className="text-xs flex items-center gap-1 mt-1">
              <CalendarDays className="h-3 w-3" />
              {format(occurrence.date, "EEE, MMM d")}
            </p>
          )}
        </div>
      </div>
      {occurrence.activeTab === "today" ? (
        <CheckCircle className="h-4 w-4 text-primary/70" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}

function renderSkeletonItems() {
  return Array(3).fill(0).map((_, i) => (
    <div key={i} className="p-3 bg-muted/40 rounded-md">
      <Skeleton className="h-5 w-40 mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  ));
}

const getItemsLabel = (order: RecurringOrder) => {
  if (!order.items) return "No items specified";
  
  return order.items.length > 30 
    ? `${order.items.substring(0, 30)}...` 
    : order.items;
};

const formatItemsList = (stop: DeliveryStop) => {
  if (Array.isArray(stop.itemsData) && stop.itemsData.length > 0) {
    return (
      <div>
        {stop.itemsData.map((item, idx) => (
          <div key={idx} className="text-sm mb-1">
            {item.quantity}x {item.name} 
            {item.price ? ` @$${item.price}` : ''}
          </div>
        ))}
      </div>
    );
  }
  
  if (stop.items) {
    return stop.items;
  }
  
  return 'No items';
};
