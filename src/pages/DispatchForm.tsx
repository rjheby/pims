import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StopsTable } from "./components/StopsTable"; // Import the edited version of StopsTable
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";

// Renamed from DispatchDetail to DispatchForm for consistency
export default function DispatchForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [masterSchedule, setMasterSchedule] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScheduleDetails() {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch master schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("dispatch_schedules")
          .select("*")
          .eq("id", id)
          .single();
        
        if (scheduleError) {
          throw scheduleError;
        }

        if (!scheduleData) {
          setError("Schedule not found");
          return;
        }

        setMasterSchedule(scheduleData);

        // Fetch all stops for this master schedule
        const { data: stopsData, error: stopsError } = await supabase
          .from("delivery_schedules")
          .select(`
            id, 
            customer_id, 
            driver_id, 
            notes, 
            items,
            status,
            customers(id, name, address)
          `)
          .eq("master_schedule_id", id)
          .order('id');
        
        if (stopsError) {
          console.error("Error fetching stops:", stopsError);
        } else {
          setStops(stopsData || []);
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        setError("Failed to load schedule details");
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleDetails();
  }, [id]);

  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return '';
    
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleScheduleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (masterSchedule) {
      const newDate = e.target.value;
      setMasterSchedule({
        ...masterSchedule,
        schedule_date: newDate
      });
    }
  };

  const calculateTotals = () => {
    const totalStops = stops.length;
    
    // Count stops by driver
    const totalByDriver = stops.reduce((acc: Record<string, number>, stop: any) => {
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

  const handleSave = async () => {
    if (!masterSchedule) return;
    
    setIsSaving(true);
    try {
      // Update master schedule
      const { error: updateError } = await supabase
        .from('dispatch_schedules')
        .update({
          schedule_date: masterSchedule.schedule_date,
          updated_at: new Date().toISOString(),
          status: 'draft'
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Schedule saved successfully",
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!masterSchedule) return;
    
    setIsSubmitting(true);
    try {
      // Update master schedule to submitted
      const { error: updateError } = await supabase
        .from('dispatch_schedules')
        .update({
          schedule_date: masterSchedule.schedule_date,
          updated_at: new Date().toISOString(),
          status: 'submitted'
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Update all stops to submitted
      for (const stop of stops) {
        const { error: stopError } = await supabase
          .from('delivery_schedules')
          .update({
            status: 'submitted'
          })
          .eq('id', stop.id);
          
        if (stopError) {
          console.error("Error updating stop:", stopError);
        }
      }

      toast({
        title: "Success",
        description: "Schedule submitted successfully",
      });
      
      navigate('/dispatch-archive');
    } catch (error) {
      console.error('Error submitting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to submit schedule",
