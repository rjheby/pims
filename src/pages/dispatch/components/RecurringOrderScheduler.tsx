
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useRecurringOrdersScheduling } from '../hooks/useRecurringOrdersScheduling';
import { parsePreferredTimeToWindow, formatTimeWindow } from '../utils/timeWindowUtils';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  // Initialize with the current schedule date and a month from now
  const endDate = new Date(scheduleDate);
  endDate.setDate(endDate.getDate() + 1); // Just look at today's schedule
  
  const { 
    recurringOrders,
    scheduledOccurrences,
    loading: recurringLoading, 
    error,
    fetchRecurringOrders,
    generateOccurrences
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
      toast({
        title: "Error",
        description: "Failed to add recurring orders: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recurring Orders for {format(scheduleDate, "EEEE, MMMM d, yyyy")}
          </CardTitle>
          <Badge variant="outline" className="ml-2">
            {availableOccurrences.length} Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {recurringLoading ? (
          <div className="text-center py-4">
            <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading recurring orders...</p>
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
              {availableOccurrences.map((occurrence) => (
                <div key={occurrence.recurringOrder.id} className="flex justify-between items-center p-3 bg-muted/40 rounded-md">
                  <div>
                    <p className="font-medium">{occurrence.recurringOrder.customer?.name}</p>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="capitalize">{occurrence.recurringOrder.frequency}</span>
                      {occurrence.recurringOrder.preferred_time && (
                        <span>• {occurrence.recurringOrder.preferred_time}</span>
                      )}
                    </div>
                  </div>
                  <CheckCircle className="h-4 w-4 text-primary/70" />
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleAddAllToSchedule}
                disabled={loading || availableOccurrences.length === 0}
                className="w-full"
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
      </CardContent>
    </Card>
  );
}
