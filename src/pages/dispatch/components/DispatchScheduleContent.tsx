
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Calendar, CheckCircle, CalendarDays, User, Truck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { StopsTable } from '@/pages/dispatch/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RecurringOrderScheduler } from './RecurringOrderScheduler';
import { parsePreferredTimeToWindow, formatTimeWindow } from '../utils/timeWindowUtils';

export function DispatchScheduleContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [scheduleNumber, setScheduleNumber] = useState<string>("");
  const [stops, setStops] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showRecurringTab, setShowRecurringTab] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Create schedule number for new schedules - SCH-YYYYMMDD-XX format
  useEffect(() => {
    const generateScheduleNumber = async () => {
      const dateStr = format(scheduleDate, "yyyyMMdd");
      const baseScheduleNum = `SCH-${dateStr}`;
      
      try {
        // Check for existing schedules with this base number
        const { data, error } = await supabase
          .from('dispatch_schedules')
          .select('schedule_number')
          .like('schedule_number', `${baseScheduleNum}%`)
          .order('schedule_number', { ascending: false });
          
        if (error) throw error;
        
        let suffix = 1;
        if (data && data.length > 0) {
          // Extract the suffix from the most recent schedule
          const lastSchedule = data[0].schedule_number;
          const lastSuffix = parseInt(lastSchedule.split('-')[2], 10);
          suffix = lastSuffix + 1;
        }
        
        // Format with leading zeros
        const suffixStr = suffix.toString().padStart(2, '0');
        setScheduleNumber(`${baseScheduleNum}-${suffixStr}`);
      } catch (error) {
        console.error("Error generating schedule number:", error);
        // Fallback to simpler format
        setScheduleNumber(`${baseScheduleNum}-01`);
      }
    };
    
    generateScheduleNumber();
  }, [scheduleDate]);

  // Fetch customers and drivers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
          .order('name');
          
        if (customersError) throw customersError;
        
        const processedCustomers = customersData.map(customer => ({
          ...customer,
          type: customer.type || 'RETAIL',
          address: customer.address || constructAddress(customer)
        }));
        
        setCustomers(processedCustomers);
        console.log(`DispatchScheduleContent: Loaded ${processedCustomers.length} customers`);
        
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, phone, email, status')
          .eq('status', 'active') // Only active drivers
          .order('name');
          
        if (driversError) throw driversError;
        
        setDrivers(driversData || []);
        console.log(`DispatchScheduleContent: Loaded ${driversData?.length || 0} drivers`);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load customers and drivers: " + error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const constructAddress = (customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  // Function to handle saving the schedule
  const handleSaveSchedule = async () => {
    if (stops.length === 0) {
      toast({
        title: "Warning",
        description: "Cannot save an empty schedule. Please add at least one stop.",
        variant: "default"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      console.log(`DispatchScheduleContent: Saving schedule with ${stops.length} stops`);
      
      // Create the master schedule record
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: scheduleNumber,
          schedule_date: scheduleDate.toISOString().split('T')[0],
          status: 'draft'
        })
        .select();
        
      if (masterError) throw masterError;
      
      const masterScheduleId = masterData[0].id;
      console.log(`DispatchScheduleContent: Created master schedule with ID ${masterScheduleId}`);
      
      // Create all delivery stops with the master schedule ID
      const stopsWithMasterId = stops.map((stop, index) => ({
        ...stop,
        master_schedule_id: masterScheduleId,
        stop_number: index + 1,
        status: 'pending',
        created_at: new Date().toISOString()
      }));
      
      const { error: stopsError } = await supabase
        .from('delivery_stops')
        .insert(stopsWithMasterId);
        
      if (stopsError) throw stopsError;
      
      console.log(`DispatchScheduleContent: Added ${stopsWithMasterId.length} stops to the schedule`);
      
      // For recurring orders, also create entries in delivery_schedules
      const recurringStops = stops.filter(stop => stop.is_recurring);
      if (recurringStops.length > 0) {
        console.log(`DispatchScheduleContent: Processing ${recurringStops.length} recurring stops`);
        
        const deliverySchedulesData = recurringStops.map(stop => ({
          customer_id: stop.customer_id,
          master_schedule_id: masterScheduleId,
          delivery_date: scheduleDate.toISOString().split('T')[0],
          schedule_type: 'recurring',
          driver_id: stop.driver_id || null,
          status: 'draft',
          notes: stop.notes || '',
          items: stop.items || ''
        }));
        
        const { error: scheduleError } = await supabase
          .from('delivery_schedules')
          .insert(deliverySchedulesData);
          
        if (scheduleError) {
          console.error("Warning: Failed to create delivery schedule entries:", scheduleError);
        }
      }
      
      toast({
        title: "Success",
        description: "Schedule saved successfully",
      });
      
      // Navigate to the edit form for the new schedule
      navigate(`/dispatch-form/${masterScheduleId}`);
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(event.target.value);
    console.log(`DispatchScheduleContent: Date changed to ${newDate.toISOString()}`);
    setScheduleDate(newDate);
    
    // When date changes, automatically trigger recurring orders tab to show
    setShowRecurringTab(true);
  };

  // Handle adding recurring order stops
  const handleAddRecurringStops = (newStops: any[]) => {
    if (newStops.length === 0) return;
    
    console.log(`DispatchScheduleContent: Adding ${newStops.length} recurring stops`);
    
    // Add the new stops to the existing stops
    setStops([...stops, ...newStops]);
    
    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring orders to the schedule`,
    });
  };

  // Get list of customer IDs already in the schedule
  const existingCustomerIds = stops.map(stop => stop.customer_id);
  
  // Count recurring stops
  const recurringStopsCount = stops.filter(stop => stop.is_recurring).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Create Dispatch Schedule</CardTitle>
              <CardDescription>
                Schedule #{scheduleNumber} • {format(scheduleDate, "EEEE, MMMM d, yyyy")}
              </CardDescription>
              {recurringStopsCount > 0 && (
                <Badge className="mt-2 bg-primary/10 text-primary">
                  {recurringStopsCount} Recurring Orders
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="scheduleDate" className="text-sm font-medium">Schedule Date:</label>
                <input
                  id="scheduleDate"
                  type="date"
                  value={format(scheduleDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <Button onClick={handleSaveSchedule} disabled={isSaving || stops.length === 0} className="ml-2 bg-[#2A4131] hover:bg-[#2A4131]/90">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recurring" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Delivery Stops</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRecurringTab(true)}
                  className="flex items-center gap-2"
                >
                  <CalendarDays className="h-4 w-4" />
                  Manage Recurring Orders
                </Button>
                <TabsList>
                  <TabsTrigger value="stops" className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    <span className="hidden md:inline">Delivery</span> Stops ({stops.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recurring" 
                    onClick={() => setShowRecurringTab(true)}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    Recurring
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="stops" className="mt-0">
              <StopsTable 
                stops={stops} 
                onStopsChange={setStops}
                useMobileLayout={false} 
                readOnly={false}
                masterScheduleId=""
                customers={customers}
                drivers={drivers}
              />
              
              {stops.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No stops have been added to this schedule yet.</p>
                  <p>Add stops by selecting the "Recurring" tab to view and add recurring orders.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recurring" className="mt-0">
              {showRecurringTab && (
                <RecurringOrderScheduler
                  scheduleDate={scheduleDate}
                  onAddStops={handleAddRecurringStops}
                  existingCustomerIds={existingCustomerIds}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
