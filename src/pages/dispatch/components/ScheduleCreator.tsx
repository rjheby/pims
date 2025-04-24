
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

export const ScheduleCreator = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    scheduleData, 
    setScheduleDate,
    stops,
    drivers,
    customers,
    loading,
    addStops,
    loadRecurringOrders
  } = useDispatchSchedule();
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRecurringTab, setShowRecurringTab] = useState(false);
  const [autoLoadedRecurring, setAutoLoadedRecurring] = useState(false);
  const [recurringStopsCount, setRecurringStopsCount] = useState(0);
  
  useEffect(() => {
    const state = location.state as { selectedDate?: string };
    if (state?.selectedDate) {
      const date = new Date(state.selectedDate);
      setScheduleDate(date);
      setShowRecurringTab(true);
    }
  }, [location.state, setScheduleDate]);

  useEffect(() => {
    const loadRecurringOrdersForDate = async () => {
      if (scheduleData.date && !autoLoadedRecurring) {
        setAutoLoadedRecurring(true);
        
        try {
          const recurringStops = await loadRecurringOrders(scheduleData.date);
          
          if (recurringStops.length > 0) {
            addStops(recurringStops);
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
  }, [scheduleData.date, autoLoadedRecurring, loadRecurringOrders, addStops, toast]);

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
              customer_id: stop.customer_id,
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
              recurring_order_id: stop.recurring_id
            });
            
          if (stopError) {
            console.error("Error creating stop:", stopError);
            return null;
          }
          
          // Create the delivery schedule entry
          const { error: scheduleError } = await supabase
            .from('delivery_schedules')
            .insert({
              customer_id: stop.customer_id,
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
          if (stop.is_recurring && stop.recurring_id) {
            const { error: joinError } = await supabase
              .from('recurring_order_schedules')
              .insert({
                recurring_order_id: stop.recurring_id,
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
      
      await Promise.all(stopsPromises);
      
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      
      navigate(`/dispatch-form/${masterSchedule.id}`);
    } catch (error: any) {
      console.error("Error creating schedule:", error);
      const errorMessage = handleSupabaseError(error);
      setSubmitError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to create schedule: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Convert Stop[] to DeliveryStop[] for compatibility with StopsTable
  const convertStopsToDeliveryStops = (stops: Stop[]): DeliveryStop[] => {
    return stops.map(stop => ({
      stop_number: stop.stop_number,
      client_id: stop.customer_id,
      customer_name: stop.customer_name,
      driver_id: stop.driver_id || undefined,
      driver_name: stop.driver_id ? undefined : undefined, // Will be populated by table component
      items: stop.items || '',
      notes: stop.notes || '',
      is_recurring: stop.is_recurring,
      recurring_order_id: stop.recurring_id,
      status: stop.status as any,
      master_schedule_id: '' // This is required for DeliveryStop but will be set on save
    }));
  };

  const handleAddRecurringStops = (newStops: DeliveryStop[]) => {
    if (newStops.length === 0) return;
    
    // Convert DeliveryStop[] to Stop[] for dispatch context
    const contextStops: Stop[] = newStops.map(stop => ({
      customer_id: stop.client_id,
      customer_name: stop.customer_name,
      customer_address: stop.customer?.address,
      customer_phone: stop.customer?.phone,
      driver_id: stop.driver_id || null,
      items: stop.items,
      notes: stop.notes,
      sequence: stop.stop_number,
      is_recurring: true,
      recurring_id: stop.recurring_order_id,
      stop_number: stop.stop_number,
      status: stop.status
    }));
    
    addStops(contextStops);
    
    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring orders to the schedule`,
    });
  };

  const existingCustomerIds = stops.map(stop => stop.customer_id);

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
                  <StopsTable 
                    stops={convertStopsToDeliveryStops(stops)} 
                    onStopsChange={() => {/* Handled by context */}}
                    useMobileLayout={isMobile}
                    customers={customers}
                    drivers={drivers}
                  />
                </TabsContent>
                
                <TabsContent value="recurring" className="mt-0">
                  {showRecurringTab && scheduleData.date && (
                    <RecurringOrderScheduler
                      scheduleDate={scheduleData.date}
                      onAddStops={handleAddRecurringStops}
                      existingClientIds={existingCustomerIds}
                      selectedRecurringOrder={null}
                      onSave={() => {}}
                      onCancel={() => {}}
                      customers={customers}
                    />
                  )}
                </TabsContent>
              </Tabs>

              <ScheduleSummary 
                data={calculateTotals(stops)}
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
