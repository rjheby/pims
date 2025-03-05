
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { Customer } from "./customers/types";
import { StopsTable } from "./dispatch/components";

interface DeliveryStop {
  id?: number;
  customer_id: string | null;
  notes: string | null;
  driver_id: string | null;
  items: string | null;
  price?: number;
  customer_address?: string;
  customer_phone?: string;
  stop_number?: number;
}

interface DispatchScheduleData {
  schedule_number: string;
  schedule_date: string;
  stops: DeliveryStop[];
}

interface Driver {
  id: string;
  name: string;
}

export default function DispatchDelivery() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // States
  const [scheduleData, setScheduleData] = useState<DispatchScheduleData>({
    schedule_number: `DS-${new Date().getTime().toString().slice(-8)}`,
    schedule_date: new Date().toISOString().split('T')[0],
    stops: []
  });
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle schedule date change
  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScheduleData(prev => ({
      ...prev,
      schedule_date: e.target.value
    }));
  };

  // Handle stops change from StopsTable component
  const handleStopsChange = (newStops: DeliveryStop[]) => {
    setScheduleData(prev => ({
      ...prev,
      stops: newStops
    }));
  };

  // Calculate summary totals
  const calculateTotals = () => {
    const totalStops = scheduleData.stops.length;
    
    // Count stops by driver
    const stopsByDriver = scheduleData.stops.reduce((acc: Record<string, number>, stop) => {
      const driverId = stop.driver_id || 'unassigned';
      acc[driverId] = (acc[driverId] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate total price
    const totalPrice = scheduleData.stops.reduce((sum: number, stop) => {
      const price = stop.price || 0;
      return sum + Number(price);
    }, 0);
    
    return {
      totalQuantity: totalStops,
      totalValue: totalPrice,
      quantityByPackaging: stopsByDriver
    };
  };

  // Validate before save/submit
  const validateSchedule = () => {
    if (!scheduleData.schedule_date) {
      throw new Error("Schedule date is required");
    }

    if (scheduleData.stops.length === 0) {
      throw new Error("At least one delivery stop is required");
    }
    
    return true;
  };

  // Save as draft
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      validateSchedule();
      
      // First create the master dispatch schedule
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_number: scheduleData.schedule_number,
          schedule_date: scheduleData.schedule_date,
          status: 'draft',
          notes: ''
        })
        .select();
        
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Then create all the delivery stops
      for (const stop of scheduleData.stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleData.schedule_date,
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
      
      // Navigate to the edit form
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
          schedule_number: scheduleData.schedule_number,
          schedule_date: scheduleData.schedule_date,
          status: 'submitted',
          notes: ''
        })
        .select();
        
      if (masterError) throw masterError;
      
      if (!masterData || masterData.length === 0) {
        throw new Error("Failed to create schedule");
      }
      
      const masterId = masterData[0].id;
      
      // Then create all the delivery stops
      for (const stop of scheduleData.stops) {
        await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: stop.customer_id,
            schedule_type: 'one-time',
            delivery_date: scheduleData.schedule_date,
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
            <CardTitle>Place Orders</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Schedule Details Section */}
            <BaseOrderDetails
              orderNumber={scheduleData.schedule_number}
              orderDate={scheduleData.schedule_date}
              deliveryDate="" // Not using delivery date field
              onOrderDateChange={handleScheduleDateChange}
              onDeliveryDateChange={() => {}} // Not used
              disabled={false}
            />
            
            {/* Stops Table */}
            <div className={isMobile ? "pb-20" : ""}>
              <StopsTable
                stops={scheduleData.stops}
                onStopsChange={handleStopsChange}
                useMobileLayout={isMobile}
              />
            </div>
            
            {/* Summary and Actions */}
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
                  showArchiveButton={true}
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
                showArchiveButton={true}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
