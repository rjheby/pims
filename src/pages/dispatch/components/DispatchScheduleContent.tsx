
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
import { DeliveryStop } from './stops/types';
import { UnscheduledOrders } from './UnscheduledOrders';

export function DispatchScheduleContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date());
  const [scheduleNumber, setScheduleNumber] = useState<string>("");
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showRecurringTab, setShowRecurringTab] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [masterScheduleId, setMasterScheduleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("schedule");

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

        // Check if there's an existing schedule for this date
        const formattedDate = format(scheduleDate, "yyyy-MM-dd");
        const { data: existingSchedules, error: schedulesError } = await supabase
          .from('dispatch_schedules')
          .select('id, schedule_number')
          .eq('schedule_date', formattedDate)
          .maybeSingle();

        if (schedulesError) throw schedulesError;

        if (existingSchedules) {
          setScheduleNumber(existingSchedules.schedule_number);
          setMasterScheduleId(existingSchedules.id);
          
          // Fetch stops for this schedule
          const { data: scheduleStops, error: stopsError } = await supabase
            .from('delivery_stops')
            .select(`
              *,
              customer:customer_id (id, name, address, phone, email),
              driver:driver_id (id, name)
            `)
            .eq('master_schedule_id', existingSchedules.id)
            .order('stop_number', { ascending: true });
            
          if (stopsError) throw stopsError;
          
          setStops(scheduleStops || []);
        } else {
          setStops([]);
          setMasterScheduleId(null);
        }

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
  }, [toast, scheduleDate]);
  
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
      
      let scheduleId = masterScheduleId;

      // Create the master schedule record if it doesn't exist
      if (!scheduleId) {
        const { data: masterData, error: masterError } = await supabase
          .from('dispatch_schedules')
          .insert({
            schedule_number: scheduleNumber,
            schedule_date: scheduleDate.toISOString().split('T')[0],
            status: 'draft'
          })
          .select();
          
        if (masterError) throw masterError;
        
        scheduleId = masterData[0].id;
        setMasterScheduleId(scheduleId);
        console.log(`DispatchScheduleContent: Created master schedule with ID ${scheduleId}`);
      } else {
        // Update existing schedule
        const { error: updateError } = await supabase
          .from('dispatch_schedules')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduleId);
          
        if (updateError) throw updateError;
      }
      
      // Update or create all delivery stops with the master schedule ID
      for (const [index, stop] of stops.entries()) {
        const stopData = {
          ...stop,
          master_schedule_id: scheduleId,
          stop_number: index + 1,
          scheduling_status: 'scheduled',
          updated_at: new Date().toISOString()
        };

        if (stop.id) {
          // Update existing stop
          const { error: stopError } = await supabase
            .from('delivery_stops')
            .update(stopData)
            .eq('id', stop.id);
            
          if (stopError) throw stopError;
        } else {
          // Create new stop
          const { error: stopError } = await supabase
            .from('delivery_stops')
            .insert({
              ...stopData,
              created_at: new Date().toISOString(),
              status: 'pending'
            });
            
          if (stopError) throw stopError;
        }
      }
      
      console.log(`DispatchScheduleContent: Saved ${stops.length} stops to the schedule`);
      
      toast({
        title: "Success",
        description: "Schedule saved successfully",
      });
      
      // Navigate to the edit form for the schedule
      if (scheduleId) {
        navigate(`/dispatch-form/${scheduleId}`);
      }
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
  const handleAddRecurringStops = (newStops: DeliveryStop[]) => {
    if (newStops.length === 0) return;
    
    console.log(`DispatchScheduleContent: Adding ${newStops.length} recurring stops`);
    
    // Add the new stops to the existing stops
    setStops(prevStops => {
      const updatedStops = [...prevStops];
      // Assign stop numbers sequentially
      for (let i = 0; i < newStops.length; i++) {
        updatedStops.push({
          ...newStops[i],
          stop_number: prevStops.length + i + 1,
          scheduling_status: 'scheduled'
        });
      }
      return updatedStops;
    });
    
    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring orders to the schedule`,
    });
  };

  // Handle adding unscheduled stops to the schedule
  const handleAddUnscheduledStops = (newStops: DeliveryStop[]) => {
    if (newStops.length === 0) return;
    
    console.log(`DispatchScheduleContent: Adding ${newStops.length} unscheduled stops`);
    
    // Add the new stops to the existing stops
    setStops(prevStops => {
      const updatedStops = [...prevStops];
      // Assign stop numbers sequentially
      for (let i = 0; i < newStops.length; i++) {
        updatedStops.push({
          ...newStops[i],
          stop_number: prevStops.length + i + 1,
          scheduling_status: 'scheduled'
        });
      }
      return updatedStops;
    });
  };

  // Get list of customer IDs already in the schedule
  const existingCustomerIds = stops.map(stop => stop.customer_id);

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create Dispatch Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Schedule: <span className="font-medium">{scheduleNumber}</span>
              </div>
              <Badge variant="outline">Draft</Badge>
            </div>
          </div>
          <CardDescription>
            Manage delivery stops for a specific date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="scheduleDate" className="text-sm font-medium">
                  Schedule Date
                </label>
                <input
                  id="scheduleDate"
                  type="date"
                  className="w-full p-2 border rounded-md"
                  value={format(scheduleDate, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="unscheduled">Unscheduled Orders</TabsTrigger>
                <TabsTrigger 
                  value="recurring" 
                  onClick={() => setShowRecurringTab(true)}
                >
                  Recurring Orders
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="schedule" className="mt-0">
                <StopsTable 
                  stops={stops} 
                  onStopsChange={setStops}
                  useMobileLayout={false}
                  customers={customers}
                  drivers={drivers}
                />
              </TabsContent>
              
              <TabsContent value="unscheduled" className="mt-0">
                <UnscheduledOrders 
                  onAddToSchedule={handleAddUnscheduledStops}
                  currentScheduleId={masterScheduleId || undefined}
                  scheduleDate={format(scheduleDate, "yyyy-MM-dd")}
                />
              </TabsContent>
              
              <TabsContent value="recurring" className="mt-0">
                {showRecurringTab && scheduleDate && (
                  <RecurringOrderScheduler
                    scheduleDate={scheduleDate}
                    onAddStops={handleAddRecurringStops}
                    existingCustomerIds={existingCustomerIds}
                    customers={customers}
                  />
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/dispatch-schedule')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSchedule}
                disabled={isSaving || loading}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
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
        </CardContent>
      </Card>
    </div>
  );
}
