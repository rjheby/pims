import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, ArrowRight, CalendarClock, CheckCircle, Loader2, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { StopsTable } from "./index";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { useToast } from "@/hooks/use-toast";
import { supabase, fetchWithFallback, handleSupabaseError } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { useDispatchSchedule } from "../context/DispatchScheduleContext";
import { calculateTotals } from "../utils/inventoryUtils";
import ScheduleSummary from "../components/ScheduleSummary";
import { RecurringOrderScheduler } from "./RecurringOrderScheduler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryStop } from "@/types";
import { Stop } from "../context/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TimeWindowGroups } from "./TimeWindowGroups";
import { RecurringOrderSync } from "./RecurringOrderSync";
import { message } from "antd";

// Helper functions to convert between Stop and DeliveryStop types
const convertStopToDeliveryStop = (stop: Stop): DeliveryStop => ({
  stop_number: stop.stop_number,
  client_id: stop.customer_id,
  customer_name: stop.customer_name,
  customer_address: stop.customer_address || '',
  customer_phone: stop.customer_phone || '',
  customer: {
    id: stop.customer_id,
    name: stop.customer_name,
    address: stop.customer_address || '',
    phone: stop.customer_phone || ''
  },
  driver_id: stop.driver_id || '',
  driver_name: '', // Default empty string since Stop type doesn't have this
  items: stop.items || '',
  notes: stop.notes || '',
  status: stop.status as any,
  is_recurring: stop.is_recurring,
  recurring_order_id: stop.recurring_id,
  master_schedule_id: ''
});

const convertDeliveryStopToStop = (stop: DeliveryStop): Stop => ({
  customer_id: stop.client_id,
  customer_name: stop.customer_name,
  customer_address: stop.customer_address,
  customer_phone: stop.customer_phone,
  driver_id: stop.driver_id,
  items: stop.items,
  notes: stop.notes,
  sequence: stop.stop_number,
  is_recurring: stop.is_recurring,
  recurring_id: stop.recurring_order_id,
  stop_number: stop.stop_number,
  status: stop.status
});

export const ScheduleCreator = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    scheduleData, 
    setScheduleDate,
    stops: contextStops,
    drivers,
    customers,
    loading,
    addStops: addContextStops,
    loadRecurringOrders
  } = useDispatchSchedule();
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRecurringTab, setShowRecurringTab] = useState(false);
  const [autoLoadedRecurring, setAutoLoadedRecurring] = useState(false);
  const [recurringStopsCount, setRecurringStopsCount] = useState(0);
  
  // Convert context stops to delivery stops for components that expect DeliveryStop[]
  const stops = contextStops.map(convertStopToDeliveryStop);
  
  useEffect(() => {
    const state = location.state as { selectedDate?: string; stops?: DeliveryStop[] };
    if (state?.selectedDate) {
      const date = new Date(state.selectedDate);
      setScheduleDate(date);
      setShowRecurringTab(true);
    }
    if (state?.stops) {
      addContextStops(state.stops.map(convertDeliveryStopToStop));
    }
  }, [location.state, setScheduleDate, addContextStops]);

  useEffect(() => {
    const loadRecurringOrdersForDate = async () => {
      if (scheduleData.date && !autoLoadedRecurring) {
        setAutoLoadedRecurring(true);
        
        try {
          const recurringStops = await loadRecurringOrders(scheduleData.date);
          
          if (recurringStops.length > 0) {
            addContextStops(recurringStops);
            setRecurringStopsCount(recurringStops.length);
            
            toast({
              title: "Recurring Orders",
              description: `Automatically added ${recurringStops.length} recurring orders for ${format(scheduleData.date, "EEEE, MMMM d")}`,
            });
          }
        } catch (error) {
          console.error("Error loading recurring orders:", error);
        }
      }
    };
    
    loadRecurringOrdersForDate();
  }, [scheduleData.date, autoLoadedRecurring, loadRecurringOrders, addContextStops, toast]);

  useEffect(() => {
    const count = stops.filter(stop => stop.is_recurring).length;
    setRecurringStopsCount(count);
  }, [stops]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Date changed to:", e.target.value);
    setAutoLoadedRecurring(false);
    setScheduleDate(new Date(e.target.value));
  };

  const handleSubmit = async () => {
    if (!scheduleData.date) {
      toast({
        title: "Missing details",
        description: "Please select a schedule date",
        variant: "destructive",
      });
      return;
    }
    
    if (stops.length === 0) {
      toast({
        title: "Missing stops",
        description: "Please add at least one delivery stop",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      const scheduleDate = scheduleData.date.toISOString().split('T')[0];
      
      const scheduleNumber = `DS-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Use fetchWithFallback to handle WebSocket connection issues
      const { data: masterSchedule, error: masterError } = await fetchWithFallback(
        'dispatch_schedules',
        (query) => query
          .insert({
            schedule_date: scheduleDate,
            schedule_number: scheduleNumber,
            status: 'draft'
          })
          .select()
          .single()
      );
        
      if (masterError) throw masterError;
      
      console.log("Created master schedule:", masterSchedule);
      
      const stopsPromises = stops.map(async (stop, index) => {
        try {
          // Create the delivery stop
          const { error: stopError } = await supabase
            .from('delivery_stops')
            .insert({
              master_schedule_id: masterSchedule.id,
              customer_id: stop.client_id,
              customer_name: stop.customer_name,
              customer_address: stop.customer_address,
              customer_phone: stop.customer_phone,
              stop_number: index + 1,
              items: stop.items || '',
              notes: stop.notes || '',
              price: stop.price || 0,
              driver_id: stop.driver_id,
              status: 'pending',
              is_recurring: !!stop.is_recurring,
              recurring_order_id: stop.recurring_order_id
            });
            
          if (stopError) {
            console.error("Error creating stop:", stopError);
            return null;
          }
          
          // Create the delivery schedule entry
          const { error: scheduleError } = await supabase
            .from('delivery_schedules')
            .insert({
              customer_id: stop.client_id,
              master_schedule_id: masterSchedule.id,
              delivery_date: scheduleDate,
              schedule_type: stop.is_recurring ? 'recurring' : 'standard',
              driver_id: stop.driver_id,
              items: stop.items || '',
              status: 'draft',
              notes: stop.notes || ''
            });
            
          if (scheduleError) {
            console.error("Error creating delivery schedule entry:", scheduleError);
          }
          
          // If this is a recurring stop, create the join table entry
          if (stop.is_recurring && stop.recurring_order_id) {
            const { error: joinError } = await supabase
              .from('recurring_order_schedules')
              .insert({
                recurring_order_id: stop.recurring_order_id,
                schedule_id: masterSchedule.id,
                status: 'active',
                modified_from_template: false
              });
              
            if (joinError) {
              console.error("Error creating recurring join entry:", joinError);
            }
          }
          
          return true;
        } catch (error) {
          console.error("Error in stop creation:", error);
          return null;
        }
      });
      
      const results = await Promise.all(stopsPromises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount === stops.length) {
        toast({
          title: "Success",
          description: "Schedule created successfully",
        });
        navigate(`/dispatch-form/${masterSchedule.id}`);
      } else {
        throw new Error(`Failed to create ${stops.length - successCount} stops`);
      }
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      setSubmitError(error.message || "Failed to create schedule");
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncComplete = (result: any) => {
    message.success("Recurring orders synced successfully");
    // TODO: Update stops in Redux store
  };

  const handleSyncError = (error: string) => {
    message.error(`Failed to sync recurring orders: ${error}`);
  };

  const handleStopsChange = (newStops: DeliveryStop[]) => {
    addContextStops(newStops.map(convertDeliveryStopToStop));
  };

  return (
    <AuthGuard requiredRole="driver">
      <div className="flex-1">
        <Card className="shadow-sm mb-16 md:mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CardTitle>Create New Dispatch Schedule</CardTitle>
                {recurringStopsCount > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {recurringStopsCount} Recurring
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BaseOrderDetails
                orderNumber="Auto-generated on save"
                orderDate={scheduleData.date ? format(scheduleData.date, "yyyy-MM-dd") : ""}
                deliveryDate={scheduleData.date ? format(scheduleData.date, "yyyy-MM-dd") : ""}
                onOrderDateChange={handleDateChange}
                onDeliveryDateChange={handleDateChange}
              />
              
              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="stops" className="w-full mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Delivery Stops</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRecurringTab(true)}
                      className={`flex items-center gap-2 ${recurringStopsCount > 0 ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <CalendarClock className="h-4 w-4" />
                      {recurringStopsCount > 0 ? `${recurringStopsCount} Recurring Orders` : 'Manage Recurring Orders'}
                    </Button>
                    <TabsList>
                      <TabsTrigger value="stops">All Stops</TabsTrigger>
                      <TabsTrigger 
                        value="recurring" 
                        onClick={() => setShowRecurringTab(true)}
                      >
                        Recurring
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>
                
                <TabsContent value="stops" className="mt-0">
                  <TimeWindowGroups stops={stops} />
                  <StopsTable 
                    stops={stops} 
                    onStopsChange={handleStopsChange}
                    useMobileLayout={isMobile}
                    customers={customers}
                    drivers={drivers}
                  />
                </TabsContent>
                
                <TabsContent value="recurring" className="mt-0">
                  {showRecurringTab && scheduleData.date && (
                    <RecurringOrderScheduler
                      customers={customers}
                      scheduleDate={scheduleData.date}
                      onAddStops={(newStops) => addContextStops(newStops.map(convertDeliveryStopToStop))}
                      existingCustomerIds={stops.map(stop => stop.client_id)}
                    />
                  )}
                </TabsContent>
              </Tabs>

              <ScheduleSummary 
                data={calculateTotals(contextStops)}
                scheduleNumber="Draft"
                scheduleDate={scheduleData.date ? format(scheduleData.date, "yyyy-MM-dd") : ""}
              />

              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dispatch-archive')}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || loading || !scheduleData.date}
                  className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Create Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};
