
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
  const [activeTab, setActiveTab] = useState<string>("today");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize with the current schedule date and a month from now
  const endDate = new Date(scheduleDate);
  endDate.setDate(endDate.getDate() + 7); // Look at the next week
  
  const { 
    recurringOrders,
    scheduledOccurrences,
    loading: recurringLoading, 
    error,
    fetchRecurringOrders,
    generateOccurrences,
    checkForScheduleConflicts
  } = useRecurringOrdersScheduling(scheduleDate, endDate);

  // Get occurrences for the selected date range
  useEffect(() => {
    if (recurringOrders.length > 0) {
      generateOccurrences(recurringOrders, scheduleDate, endDate);
    }
  }, [recurringOrders, scheduleDate, endDate, generateOccurrences]);

  // Filter occurrences that occur on the schedule date
  const currentDateOccurrences = scheduledOccurrences.filter(occurrence => {
    return occurrence.date.toDateString() === scheduleDate.toDateString();
  });

  // Filter out customers already in the schedule
  const availableOccurrences = currentDateOccurrences.filter(occurrence => {
    return !existingCustomerIds.includes(occurrence.recurringOrder.customer_id);
  });

  // Get occurrences for the next 7 days for the planning tab
  const getPlanningOccurrences = () => {
    const planEndDate = new Date(scheduleDate);
    planEndDate.setDate(planEndDate.getDate() + 7);
    
    return scheduledOccurrences.filter(occurrence => {
      const occurrenceDate = new Date(occurrence.date);
      return occurrenceDate >= scheduleDate && occurrenceDate <= planEndDate;
    }).sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date
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
      // Convert occurrences to stop format
      const newStops = availableOccurrences.map((occurrence, index) => {
        const order = occurrence.recurringOrder;
        const customer = order.customer;
        
        if (!customer) return null;
        
        const timeWindow = parsePreferredTimeToWindow(order.preferred_time);
        const formattedTimeWindow = formatTimeWindow(timeWindow);
        
        return {
          stop_number: existingCustomerIds.length + index + 1,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_address: customer.address || '',
          customer_phone: customer.phone || '',
          items: '', // No default items
          notes: `Recurring ${order.frequency} order - ${formattedTimeWindow}`,
          price: 0,
          is_recurring: true,
          recurring_id: order.id,
          status: 'pending'
        };
      }).filter(Boolean) as any[];
      
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

  const handleRetry = () => {
    setConnectionError(null);
    fetchRecurringOrders();
  };

  const renderOccurrenceItem = (occurrence: any) => {
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
            </div>
            {activeTab === "planning" && (
              <p className="text-xs flex items-center gap-1 mt-1">
                <CalendarDays className="h-3 w-3" />
                {format(occurrence.date, "EEE, MMM d")}
              </p>
            )}
          </div>
        </div>
        {activeTab === "today" ? (
          <CheckCircle className="h-4 w-4 text-primary/70" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    );
  };

  const renderSkeletonItems = () => {
    return Array(3).fill(0).map((_, i) => (
      <div key={i} className="p-3 bg-muted/40 rounded-md">
        <Skeleton className="h-5 w-40 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ));
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Orders for {format(scheduleDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <Badge variant="outline" className={activeTab === "today" 
            ? "ml-2 bg-primary/10 text-primary" 
            : "ml-2"}>
            {activeTab === "today" 
              ? `${availableOccurrences.length} Available` 
              : `${planningOccurrences.length} Upcoming`}
          </Badge>
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
                  {availableOccurrences.map(renderOccurrenceItem)}
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
                  {planningOccurrences.map(renderOccurrenceItem)}
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
