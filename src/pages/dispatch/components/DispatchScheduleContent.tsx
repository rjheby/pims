
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon, Clock, AlarmClock, Plus, CalendarClock, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DeliveryStop, Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RecurringOrderScheduler } from './RecurringOrderScheduler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export function DispatchScheduleContent({ schedules, loading, onRefresh }: DispatchScheduleContentProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedulesForSelectedDate, setSchedulesForSelectedDate] = useState<ScheduleRoute[]>([]);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [showRecurringPanel, setShowRecurringPanel] = useState(false);
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Effect to fetch customers for RecurringOrderScheduler
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
  
  useEffect(() => {
    if (selectedDate && schedules.length > 0) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const filteredSchedules = schedules.filter(schedule => schedule.date === formattedDate);
      setSchedulesForSelectedDate(filteredSchedules);
    } else {
      setSchedulesForSelectedDate([]);
    }
  }, [selectedDate, schedules]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
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
    navigate('/schedule-creator', { state: { selectedDate: format(selectedDate, 'yyyy-MM-dd') } });
  };

  const handleViewSchedule = (scheduleId: string) => {
    navigate(`/dispatch-form/${scheduleId}`);
  };

  const handleAddStops = (newStops: DeliveryStop[]) => {
    // Implement the handler to add stops via the existing route
    if (newStops.length === 0) {
      toast({
        title: "No stops added",
        description: "No recurring orders were selected to add",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring stops to create a new schedule`,
    });
    
    // Redirect to schedule creator with the new stops
    navigate('/schedule-creator', {
      state: {
        selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        stops: newStops
      }
    });
  };

  const noScheduleMessage = selectedDate 
    ? `No schedules found for ${format(selectedDate, 'MMMM d, yyyy')}` 
    : "Select a date to see schedules";

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
              <Calendar
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
                : noScheduleMessage}
            </div>
          </CardFooter>
        </Card>

        <Card className="flex-[2]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                {selectedDate ? `Schedules for ${format(selectedDate, 'MMMM d, yyyy')}` : "Schedules"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Create a new schedule</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose how you want to create your new dispatch schedule.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Button 
                          onClick={handleCreateSchedule}
                          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Schedule
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRecurringPanel(true)}
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Start from Recurring Orders
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showRecurringPanel ? (
              <Tabs defaultValue="recurring">
                <TabsList className="mb-4">
                  <TabsTrigger 
                    value="schedules" 
                    onClick={() => setShowRecurringPanel(false)}
                  >
                    Schedules
                  </TabsTrigger>
                  <TabsTrigger value="recurring">Recurring Orders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recurring" className="mt-0">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium mb-2">Schedule From Recurring Orders</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add recurring orders to create a new schedule for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}.
                    </p>
                    
                    <RecurringOrderScheduler
                      scheduleDate={selectedDate || new Date()}
                      onAddStops={handleAddStops}
                      existingClientIds={[]}
                      selectedRecurringOrder={null}
                      onSave={() => {}}
                      onCancel={() => setShowRecurringPanel(false)}
                      customers={customers}
                    />
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRecurringPanel(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="schedules" className="mt-0">
                  {/* Schedules tab content goes here */}
                </TabsContent>
              </Tabs>
            ) : (
              <>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Clock className="animate-spin h-6 w-6 mr-2" />
                    <span>Loading schedules...</span>
                  </div>
                ) : schedulesForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {schedulesForSelectedDate.map((schedule) => (
                      <div 
                        key={schedule.id}
                        className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewSchedule(schedule.id)}
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">{schedule.number}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <AlarmClock className="h-3 w-3" />
                            {format(new Date(schedule.date), 'MMMM d, yyyy')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={schedule.status === 'completed' ? 'success' : 'outline'} 
                            className="capitalize"
                          >
                            {schedule.status}
                          </Badge>
                          {schedule.stops && (
                            <Badge variant="outline" className="bg-gray-100">
                              {schedule.stops} stops
                            </Badge>
                          )}
                          <Button size="sm" variant="ghost">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPinIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Schedules Found</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-sm">
                      There are no schedules created for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'this date'}.
                    </p>
                    <Button 
                      onClick={handleCreateSchedule}
                      className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Schedule
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
