
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StopsTable } from "./index";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { DeliveryStop } from "./stops/types";
import { calculatePrice } from "./stops/utils";

interface ScheduleData {
  schedule_number: string;
  schedule_date: string;
}

interface ScheduleCreatorProps {
  initialStops?: DeliveryStop[];
  initialScheduleDate?: string;
  onSaved?: (scheduleId: string) => void;
  onSubmitted?: () => void;
}

// Helper function to format date for display
const formatDisplayDate = (dateString: string): string => {
  try {
    // Use parseISO to handle date string consistently across timezones
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const ScheduleCreator = ({ 
  initialStops = [],
  initialScheduleDate,
  onSaved,
  onSubmitted
}: ScheduleCreatorProps) => {
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
      ? `D${driverIds.map(id => id.slice(0, 4)).join('')}` 
      : 'D00';
    
    return `DS-${creationFormatted}-${deliveryDOW}-${driverCode}`;
  };
  
  const defaultDate = initialScheduleDate || new Date().toISOString().split('T')[0];
  
  const [schedule, setSchedule] = useState<ScheduleData>(() => {
    return {
      schedule_number: generateScheduleNumber(defaultDate),
      schedule_date: defaultDate
    };
  });
  
  const [stops, setStops] = useState<DeliveryStop[]>(initialStops);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    // Get current driver IDs for schedule number generation
    const driverIds = stops
      .map(stop => stop.driver_id)
      .filter((id): id is string => Boolean(id))
      .filter((id, index, array) => array.indexOf(id) === index)
      .sort();
      
    setSchedule(prev => ({
      ...prev,
      schedule_date: newDate,
      schedule_number: generateScheduleNumber(newDate, driverIds)
    }));
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
      
      // Save each stop to the database
      for (const stop of stops) {
        const stopData = {
          customer_id: stop.customer_id,
          customer_name: stop.customer_name,
          customer_address: stop.customer_address,
          customer_phone: stop.customer_phone,
          driver_id: stop.driver_id,
          driver_name: stop.driver_name,
          items: stop.items,
          notes: stop.notes,
          stop_number: stop.stop_number,
          price: stop.price || calculatePrice(stop.items || null),
          status: 'draft',
          master_schedule_id: masterId
        };

        // Add recurring settings if present
        if (stop.recurring?.isRecurring) {
          await supabase
            .from('delivery_schedules')
            .insert({
              ...stopData,
              schedule_type: 'recurring',
              recurring_frequency: stop.recurring.frequency,
              recurring_day: stop.recurring.preferredDay,
              recurring_start_date: stop.recurring.startDate,
              recurring_end_date: stop.recurring.endDate
            });
        } else {
          await supabase
            .from('delivery_schedules')
            .insert({
              ...stopData,
              schedule_type: 'one-time',
              delivery_date: schedule.schedule_date
            });
        }
      }
      
      toast({
        title: "Success",
        description: "Schedule saved as draft"
      });
      
      if (onSaved) {
        onSaved(masterId);
      } else {
        // Navigate to the edit form
        navigate(`/dispatch-form/${masterId}`);
      }
      
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
      
      // Save each stop with submitted status
      for (const stop of stops) {
        const stopData = {
          customer_id: stop.customer_id,
          customer_name: stop.customer_name,
          customer_address: stop.customer_address,
          customer_phone: stop.customer_phone,
          driver_id: stop.driver_id,
          driver_name: stop.driver_name,
          items: stop.items,
          notes: stop.notes,
          stop_number: stop.stop_number,
          price: stop.price || calculatePrice(stop.items || null),
          status: 'submitted',
          master_schedule_id: masterId
        };

        // Add recurring settings if present
        if (stop.recurring?.isRecurring) {
          await supabase
            .from('delivery_schedules')
            .insert({
              ...stopData,
              schedule_type: 'recurring',
              recurring_frequency: stop.recurring.frequency,
              recurring_day: stop.recurring.preferredDay,
              recurring_start_date: stop.recurring.startDate,
              recurring_end_date: stop.recurring.endDate
            });
        } else {
          await supabase
            .from('delivery_schedules')
            .insert({
              ...stopData,
              schedule_type: 'one-time',
              delivery_date: schedule.schedule_date
            });
        }
      }
      
      toast({
        title: "Success",
        description: "Schedule submitted successfully"
      });
      
      if (onSubmitted) {
        onSubmitted();
      } else {
        // Navigate to archive
        navigate('/dispatch-archive');
      }
      
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
  
  const handleStopsChange = (newStops: DeliveryStop[]) => {
    setStops(newStops);
    
    // Update schedule number based on drivers
    const driverIds = newStops
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
  };
  
  const calculateTotals = () => {
    const totalStops = stops.length;
    
    // Count stops by driver
    const stopsByDriver: Record<string, number> = {};
    stops.forEach(stop => {
      const driverName = stop.driver_name || 'Unassigned';
      stopsByDriver[driverName] = (stopsByDriver[driverName] || 0) + 1;
    });
    
    // Calculate total price
    const totalPrice = stops.reduce((sum: number, stop) => {
      // If price is already calculated, use it; otherwise calculate based on items
      const price = stop.price || calculatePrice(stop.items || null);
      return sum + Number(price);
    }, 0);
    
    return {
      totalQuantity: totalStops,
      totalValue: totalPrice,
      quantityByPackaging: stopsByDriver
    };
  };
  
  return (
    <div className="flex-1">
      <Card className="shadow-sm mx-auto max-w-6xl mb-24 md:mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl md:text-2xl">
              {isMobile ? "Delivery Schedule" : `Delivery Schedule for ${formatDisplayDate(schedule.schedule_date)}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Schedule Details</h3>
              <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-6`}>
                <div className="space-y-2">
                  <label htmlFor="schedule-date" className="block text-sm font-medium">
                    Schedule Date
                  </label>
                  <div className="flex">
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        id="schedule-date"
                        type="date"
                        value={schedule.schedule_date}
                        onChange={handleScheduleDateChange}
                        className="border rounded-md px-3 py-2 pl-10 w-full"
                      />
                    </div>
                  </div>
                  {isMobile ? (
                    <p className="text-sm text-gray-600 font-semibold">
                      {formatDisplayDate(schedule.schedule_date)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
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
                    className="border rounded-md px-3 py-2 w-full bg-gray-100"
                  />
                  <p className="text-sm text-gray-600">
                    Auto-generated based on date and assigned drivers
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`${isMobile ? "pb-20" : ""} mx-auto`}>
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
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10 safe-area-bottom">
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
};
