import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { StopsTable } from "./components/StopsTable";
import { useDispatchSchedule } from "./context/DispatchScheduleContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function DispatchScheduleContent() {
  const { 
    scheduleNumber, 
    scheduleDate, 
    handleScheduleDateChange,
    stops,
    generateScheduleNumber
  } = useDispatchSchedule();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Header details
  const headerDetails = scheduleDate && `Schedule Date: ${formatDate(scheduleDate)}`;

  // Calculate totals for all stops
  const calculateTotals = () => {
    const totalStops = stops.length;
    const totalByDriver = stops.reduce((acc, stop) => {
      const driverId = stop.driver_id || 'unassigned';
      acc[driverId] = (acc[driverId] || 0) + 1;
      return acc;
    }, {});

    return {
      totalQuantity: totalStops,
      quantityByPackaging: totalByDriver,
      totalValue: totalStops
    };
  };

  // Validate schedule before saving/submitting
  const validateSchedule = () => {
    if (!scheduleDate) {
      throw new Error("Schedule date is required");
    }

    if (stops.length === 0) {
      throw new Error("At least one stop is required");
    }

    return true;
  };

  // Handle save as draft
  const handleSave = async () => {
    setIsSaving(true);
    try {
      validateSchedule();
      
      let currentScheduleNumber = scheduleNumber;
      if (!currentScheduleNumber) {
        currentScheduleNumber = await generateScheduleNumber(scheduleDate);
      }

      // First, create the master schedule
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: currentScheduleNumber,
          schedule_date: scheduleDate,
          status: 'draft',
          notes: ''
        })
        .select();

      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create master schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Now, create all the stops
      for (const stop of stops) {
        const { error: stopError } = await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleDate,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'draft',
            master_schedule_id: masterId
          });
          
        if (stopError) {
          console.error("Error creating stop:", stopError);
          // Continue with other stops even if one fails
        }
      }

      toast({
        title: "Schedule Saved",
        description: "Your dispatch schedule has been saved as a draft"
      });
      
      navigate(`/dispatch-form/${masterId}`);
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      validateSchedule();
      
      let currentScheduleNumber = scheduleNumber;
      if (!currentScheduleNumber) {
        currentScheduleNumber = await generateScheduleNumber(scheduleDate);
      }

      // First, create the master schedule
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: currentScheduleNumber,
          schedule_date: scheduleDate,
          status: 'submitted',
          notes: ''
        })
        .select();

      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create master schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Now, create all the stops with submitted status
      for (const stop of stops) {
        const { error: stopError } = await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleDate,
            notes: stop.notes,
            driver_id: stop.driver_id,
            items: stop.items,
            status: 'submitted',
            master_schedule_id: masterId
          });
          
        if (stopError) {
          console.error("Error creating stop:", stopError);
          // Continue with other stops even if one fails
        }
      }

      toast({
        title: "Schedule Submitted",
        description: "Your dispatch schedule has been submitted successfully"
      });
      
      navigate("/dispatch-archive");
    } catch (err) {
      console.error('Error submitting schedule:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit schedule",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-10">
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">
                {scheduleNumber ? `Dispatch Schedule #${scheduleNumber}` : 'New Dispatch Schedule'}
              </CardTitle>
              {headerDetails && (
                <CardDescription className="mt-1 text-sm">
                  {headerDetails}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            <BaseOrderDetails 
              orderNumber={scheduleNumber}
              orderDate={scheduleDate}
              deliveryDate={scheduleDate}
              onOrderDateChange={handleScheduleDateChange}
              onDeliveryDateChange={handleScheduleDateChange}
              dateLabel="Schedule Date"
              hideDateDelivery={true}
            />
            <div className="w-full overflow-x-auto pb-4">
              <StopsTable />
            </div>
            <BaseOrderSummary items={calculateTotals()} />
            <BaseOrderActions 
              onSave={handleSave} 
              onSubmit={handleSubmit}
              archiveLink="/dispatch-archive"
              isSaving={isSaving}
              isSubmitting={isSubmitting}
              submitLabel="Submit Schedule"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
