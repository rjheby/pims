import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StopsTable } from "./dispatch/components/StopsTable";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { Customer } from "./customers/types";
import { DispatchScheduleProvider } from './dispatch/context/DispatchScheduleContext';

interface ScheduleData {
  schedule_number: string;
  schedule_date: string;
}

interface Driver {
  id: string;
  name: string;
}

// Content component with all the functionality
function DateBasedScheduleCreatorContent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Generate schedule number based on date and drivers
  const generateScheduleNumber = (dateString: string, driverIds: string[] = []) => {
    // Create date objects
    const creationDate = new Date();
    const deliveryDate = new Date(dateString);
    
    // Format creation date as YYMMDD
    const creationFormatted = creationDate.toISOString().slice(2, 10).replace(/-/g, '');
    
    // Get day of week for delivery
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const deliveryDOW = daysOfWeek[deliveryDate.getDay()];
    
    // Generate driver code
    const driverCode = driverIds.length > 0 
      ? `D${driverIds.map(id => id.replace('driver-', '')).join('')}` 
      : 'D00';
    
    // Generate the schedule number
    return `DS-${creationFormatted}-${deliveryDOW}-${driverCode}`;
  };
  
  // States
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
  
  // Update schedule number when date changes
  useEffect(() => {
    if (schedule.schedule_date) {
      // Get current driver IDs from stops
      const driverIds = stops
        .map(stop => stop.driver_id)
        .filter((id): id is string => Boolean(id)) // Type guard to filter out null/undefined
        .filter((id, index, array) => array.indexOf(id) === index) // Unique values
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
  
  // Update schedule number when drivers change
  useEffect(() => {
    if (stops.length > 0 && schedule.schedule_date) {
      // Extract unique driver IDs from stops
      const driverIds = stops
        .map(stop => stop.driver_id)
        .filter((id): id is string => Boolean(id)) // Type guard to filter out null/undefined
        .filter((id, index, array) => array.indexOf(id) === index) // Unique values
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
  
  // Handle schedule date change
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedule(prev => ({
      ...prev,
      schedule_date: e.target.value
    }));
  };
  
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate summary totals from stops
  const calculateTotals = () => {
    const totalStops = stops.length;
    
    // Count by driver
    const stopsByDriver = stops.reduce((acc: Record<string, number>, stop) => {
      const driverId = stop.driver_id || 'unassigned';
      acc[driverId] = (acc[driverId] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalQuantity: totalStops,
      totalValue: totalStops,
      quantityByPackaging: stopsByDriver
    };
  };
  
  // Validate schedule before saving/submitting
  const validateSchedule = () => {
    if (!schedule.schedule_date) {
      throw new Error("Schedule date is required");
    }
    
    if (stops.length === 0) {
      throw new Error("At least one delivery stop is required");
    }
    
    return true;
  };
  
  // Save as draft
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      validateSchedule();
      
      // First create the master schedule
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
      
      // Then create all stops with the same delivery date
      for (const stop of stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: schedule.schedule_date, // All stops have the same date
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
      
      // Navigate to edit form
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
  
  // Submit schedule
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      validateSchedule();
      
      // First create the master schedule
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
      
      // Then create all stops with the same delivery date
      for (const stop of stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: schedule.schedule_date, // All stops have the same date
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
      
      // Navigate to archive
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
  
  // Handle stops changes from StopsTable component
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
          <div className="flex justify-between items-center">
            <CardTitle>
              New Dispatch Schedule for {formatDisplayDate(schedule.schedule_date)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Schedule Date Selection */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Schedule Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-sm text-gray-500">
                    All stops will be scheduled for {formatDisplayDate(schedule.schedule_date)}
                  </p>
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
            
            {/* Stops Table */}
            <StopsTable
              stops={stops}
              onStopsChange={handleStopsChange}
            />
            
            {/* Summary and Actions */}
            <BaseOrderSummary 
              items={calculateTotals()}
            />
            
            <BaseOrderActions
              onSave={handleSave}
              onSubmit={handleSubmit}
              submitLabel="Submit Schedule"
              archiveLink="/dispatch-archive"
              isSaving={isSaving}
              isSubmitting={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper component that provides the context
export default function DateBasedScheduleCreator() {
  return (
    <DispatchScheduleProvider>
      <DateBasedScheduleCreatorContent />
    </DispatchScheduleProvider>
  );
}
