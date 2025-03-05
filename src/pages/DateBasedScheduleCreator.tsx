import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StopsTable } from "./dispatch/components";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { Customer } from "./customers/types";
import { DispatchScheduleProvider } from './dispatch/context/DispatchScheduleContext';
import { useIsMobile } from "@/hooks/use-mobile";

interface ScheduleData {
  schedule_number: string;
  schedule_date: string;
}

interface Driver {
  id: string;
  name: string;
}

function DateBasedScheduleCreatorContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const generateScheduleNumber = (dateString: string, driverIds: string[] = []) => {
    const creationDate = new Date();
    const deliveryDate = new Date(dateString);
    
    const creationFormatted = creationDate.toISOString().slice(2, 10).replace(/-/g, '');
    
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const deliveryDOW = daysOfWeek[deliveryDate.getDay()];
    
    const driverCode = driverIds.length > 0 
      ? `D${driverIds.map(id => id.replace('driver-', '')).join('')}` 
      : 'D00';
    
    return `DS-${creationFormatted}-${deliveryDOW}-${driverCode}`;
  };
  
  const [schedule, setSchedule] = useState<ScheduleData>(() => {
    const today = new Date();
    const defaultDate = today.toISOString().split('T')[0];
    
    return {
      schedule_number: generateScheduleNumber(defaultDate),
      schedule_date: defaultDate
    };
  });
  
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (schedule.schedule_date) {
      const driverIds = stops
        .map(stop => stop.driver_id)
        .filter((id): id is string => Boolean(id))
        .filter((id, index, array) => array.indexOf(id) === index)
        .sort();
      
      const newScheduleNumber = generateScheduleNumber(schedule.schedule_date, driverIds);
      
      if (newScheduleNumber !== schedule.schedule_number) {
        setSchedule(prev => ({
          ...prev,
          schedule_number: newScheduleNumber
        }));
      }
    }
  }, [schedule.schedule_date]);
  
  useEffect(() => {
    if (stops.length > 0 && schedule.schedule_date) {
      const driverIds = stops
        .map(stop => stop.driver_id)
        .filter((id): id is string => Boolean(id))
        .filter((id, index, array) => array.indexOf(id) === index)
        .sort();
      
      const newScheduleNumber = generateScheduleNumber(schedule.schedule_date, driverIds);
      
      if (newScheduleNumber !== schedule.schedule_number) {
        setSchedule(prev => ({
          ...prev,
          schedule_number: newScheduleNumber
        }));
      }
    }
  }, [stops]);
  
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedule(prev => ({
      ...prev,
      schedule_date: e.target.value
    }));
  };
  
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const calculateTotals = () => {
    const totalStops = stops.length;
    
    // Count stops by driver
    const stopsByDriver = stops.reduce((acc: Record<string, number>, stop) => {
      const driverId = stop.driver_id || 'unassigned';
      acc[driverId] = (acc[driverId] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate total price
    const totalPrice = stops.reduce((sum: number, stop) => {
      const price = stop.price || 0;
      return sum + Number(price);
    }, 0);
    
    return {
      totalQuantity: totalStops,
      totalValue: totalPrice,
      quantityByPackaging: stopsByDriver
    };
  };
  
  const validateSchedule = () => {
    if (!schedule.schedule_date) {
      throw new Error("Schedule date is required");
    }
    
    if (stops.length === 0) {
      throw new Error("At least one delivery stop is required");
    }
    
    return true;
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      validateSchedule();
      
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: schedule.schedule_number,
          schedule_date: schedule.schedule_date,
          status: 'draft',
          notes: ''
        })
        .select();
      
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      for (const stop of stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: schedule.schedule_date,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'draft',
            master_schedule_id: masterId
          });
      }
      
      toast({
        title: "Success",
        description: "Schedule saved as draft"
      });
      
      navigate(`/dispatch-form/${masterId}`);
      
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      validateSchedule();
      
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: schedule.schedule_number,
          schedule_date: schedule.schedule_date,
          status: 'submitted',
          notes: ''
        })
        .select();
      
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      for (const stop of stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: schedule.schedule_date,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'submitted',
            master_schedule_id: masterId
          });
      }
      
      toast({
        title: "Success",
        description: "Schedule submitted successfully"
      });
      
      navigate('/dispatch-archive');
      
    } catch (error: any) {
      console.error('Error submitting schedule:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit schedule",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStopsChange = (newStops: any[]) => {
    setStops(newStops);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle className="text-xl md:text-2xl">
              {isMobile ? "New Schedule" : `New Dispatch Schedule for ${formatDisplayDate(schedule.schedule_date)}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Schedule Details</h3>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-4`}>
                <div className="space-y-2">
                  <label htmlFor="schedule-date" className="block text-sm font-medium">
                    Schedule Date
                  </label>
                  <div className="flex">
                    <input
                      id="schedule-date"
                      type="date"
                      value={schedule.schedule_date}
                      onChange={handleScheduleDateChange}
                      className="border rounded-md px-3 py-2 w-full"
                    />
                  </div>
                  {isMobile ? (
                    <p className="text-sm text-gray-500 font-semibold">
                      {formatDisplayDate(schedule.schedule_date)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      All stops will be scheduled for {formatDisplayDate(schedule.schedule_date)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="schedule-number" className="block text-sm font-medium">
                    Schedule Number
                  </label>
                  <input
                    id="schedule-number"
                    type="text"
                    value={schedule.schedule_number}
                    readOnly
                    className="border rounded-md px-3 py-2 w-full bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Auto-generated based on date and assigned drivers
                  </p>
                </div>
              </div>
            </div>
            
            <div className={isMobile ? "pb-20" : ""}>
              <StopsTable
                stops={stops}
                onStopsChange={handleStopsChange}
                useMobileLayout={isMobile}
              />
            </div>
            
            <BaseOrderSummary 
              items={calculateTotals()}
            />
            
            {isMobile ? (
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
                <BaseOrderActions
                  onSave={handleSave}
                  onSubmit={handleSubmit}
                  submitLabel="Submit Schedule"
                  archiveLink="/dispatch-archive"
                  isSaving={isSaving}
                  isSubmitting={isSubmitting}
                  mobileLayout={true}
                />
              </div>
            ) : (
              <BaseOrderActions
                onSave={handleSave}
                onSubmit={handleSubmit}
                submitLabel="Submit Schedule"
                archiveLink="/dispatch-archive"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DateBasedScheduleCreator() {
  return (
    <DispatchScheduleProvider>
      <DateBasedScheduleCreatorContent />
    </DispatchScheduleProvider>
  );
}
