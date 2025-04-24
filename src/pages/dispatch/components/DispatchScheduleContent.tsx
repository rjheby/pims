import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { MapPinIcon, Clock, AlarmClock, Plus, CalendarClock, PlusCircle, Loader2, Calendar, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Customer } from '@/pages/customers/types';
import { DeliveryStop } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RecurringOrderScheduler } from './RecurringOrderScheduler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StopsTable } from './StopsTable';
import { TimeWindowGroups } from './TimeWindowGroups';
import { RecurringOrderSync } from './RecurringOrderSync';
import { SyncResult } from './stops/types';
import { message } from 'antd';

interface ScheduleRoute {
  id: string;
  date: string;
  number: string;
  status: string;
  stops?: number;
}

interface DispatchScheduleContentProps {
  schedules: ScheduleRoute[];
  loading: boolean;
  onRefresh: () => void;
}

export function DispatchScheduleContent({ schedules, loading: propsLoading, onRefresh }: DispatchScheduleContentProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedulesForSelectedDate, setSchedulesForSelectedDate] = useState<ScheduleRoute[]>([]);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [showRecurringPanel, setShowRecurringPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scheduleNumber, setScheduleNumber] = useState<string>("");
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Effect to fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    
    fetchCustomers();
  }, []);

  // Effect to fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setDrivers(data || []);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };
    
    fetchDrivers();
  }, []);

  // Effect to update schedules for selected date
  useEffect(() => {
    if (selectedDate && schedules.length > 0) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const filteredSchedules = schedules.filter(schedule => schedule.date === formattedDate);
      setSchedulesForSelectedDate(filteredSchedules);
    } else {
      setSchedulesForSelectedDate([]);
    }
  }, [selectedDate, schedules]);

  // Effect to generate schedule number
  useEffect(() => {
    const generateScheduleNumber = async () => {
      const dateStr = format(selectedDate, "yyyyMMdd");
      const baseScheduleNum = `SCH-${dateStr}`;
      
      try {
        const { data, error } = await supabase
          .from('dispatch_schedules')
          .select('schedule_number')
          .like('schedule_number', `${baseScheduleNum}%`)
          .order('schedule_number', { ascending: false });
          
        if (error) throw error;
        
        let suffix = 1;
        if (data && data.length > 0) {
          const lastSchedule = data[0].schedule_number;
          const lastSuffix = parseInt(lastSchedule.split('-')[2], 10);
          suffix = lastSuffix + 1;
        }
        
        const suffixStr = suffix.toString().padStart(2, '0');
        setScheduleNumber(`${baseScheduleNum}-${suffixStr}`);
      } catch (error) {
        console.error("Error generating schedule number:", error);
        setScheduleNumber(`${baseScheduleNum}-01`);
      }
    };
    
    generateScheduleNumber();
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleCreateSchedule = () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date first",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingSchedule(true);
    navigate('/schedule-creator', { 
      state: { 
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        stops: stops
      } 
    });
  };

  const handleViewSchedule = (scheduleId: string) => {
    navigate(`/dispatch-form/${scheduleId}`);
  };

  const handleAddStops = (newStops: DeliveryStop[]) => {
    if (newStops.length === 0) {
      toast({
        title: "No stops added",
        description: "No recurring orders were selected to add",
        variant: "default",
      });
      return;
    }

    setStops([...stops, ...newStops]);
    
    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring stops to create a new schedule`,
    });
    
    navigate('/schedule-creator', {
      state: {
        selectedDate: format(selectedDate, 'yyyy-MM-dd'),
        stops: [...stops, ...newStops]
      }
    });
  };

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
      // Create the master schedule record
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: scheduleNumber,
          schedule_date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'draft'
        })
        .select();
        
      if (masterError) throw masterError;
      
      const masterScheduleId = masterData[0].id;
      
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
      
      // For recurring orders, also create entries in delivery_schedules
      const recurringStops = stops.filter(stop => stop.is_recurring);
      if (recurringStops.length > 0) {
        const deliverySchedulesData = recurringStops.map(stop => ({
          customer_id: stop.client_id,
          master_schedule_id: masterScheduleId,
          delivery_date: format(selectedDate, 'yyyy-MM-dd'),
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

  const handleSyncComplete = (result: SyncResult) => {
    message.success("Recurring orders synced successfully");
    // TODO: Update stops in Redux store
  };

  const handleSyncError = (error: string) => {
    message.error(`Failed to sync recurring orders: ${error}`);
  };

  // Get list of customer IDs already in the schedule
  const existingCustomerIds = stops.map(stop => stop.client_id);
  
  // Count recurring stops
  const recurringStopsCount = stops.filter(stop => stop.is_recurring).length;

  if (loading || propsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="text-sm text-gray-500">
              {schedulesForSelectedDate.length > 0 
                ? `${schedulesForSelectedDate.length} schedule(s) for this date`
                : selectedDate 
                  ? `No schedules found for ${format(selectedDate, 'MMMM d, yyyy')}`
                  : "Select a date to see schedules"}
            </div>
          </CardFooter>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={handleCreateSchedule}
              disabled={!selectedDate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Schedule
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowRecurringPanel(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Recurring Orders
            </Button>

            <Button
              className="w-full"
              onClick={handleSaveSchedule}
              disabled={isSaving || stops.length === 0}
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
          </CardContent>
        </Card>
      </div>

      {schedulesForSelectedDate.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Schedules for Selected Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedulesForSelectedDate.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewSchedule(schedule.id)}
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{schedule.number}</Badge>
                    <div>
                      <div className="font-medium">{schedule.status}</div>
                      <div className="text-sm text-gray-500">
                        {schedule.stops} stops
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showRecurringPanel && (
        <RecurringOrderScheduler
          customers={customers}
          scheduleDate={selectedDate}
          onAddStops={handleAddStops}
          existingCustomerIds={existingCustomerIds}
        />
      )}

      <TimeWindowGroups stops={stops} />
    </div>
  );
}
