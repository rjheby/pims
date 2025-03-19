
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDispatchForm(id: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [masterSchedule, setMasterSchedule] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduleDetails();
  }, [id]);

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

      // Fetch all stops for this master schedule with customer and driver details
      const { data: stopsData, error: stopsError } = await supabase
        .from("delivery_schedules")
        .select(`
          id, 
          customer_id, 
          driver_id, 
          notes, 
          items,
          status,
          customers(id, name, address, phone, email, street_address, city, state, zip_code)
        `)
        .eq("master_schedule_id", id)
        .order('id');
      
      if (stopsError) {
        console.error("Error fetching stops:", stopsError);
      } else {
        // Process stops to ensure all required fields
        const processedStops = (stopsData || []).map((stop, index) => {
          // Construct full address if needed
          let address = stop.customers?.address;
          if (!address && stop.customers) {
            const addressParts = [
              stop.customers.street_address,
              stop.customers.city,
              stop.customers.state,
              stop.customers.zip_code
            ].filter(Boolean);
            
            if (addressParts.length > 0) {
              address = addressParts.join(', ');
            }
          }
          
          return {
            ...stop,
            stop_number: index + 1,
            customer_name: stop.customers?.name || 'Unknown Customer',
            customer_address: address || '',
            customer_phone: stop.customers?.phone || '',
            price: calculatePrice(stop.items)
          };
        });
        
        setStops(processedStops);
      }
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      setError("Failed to load schedule details");
    } finally {
      setLoading(false);
    }
  }

  const calculatePrice = (items: string): number => {
    if (!items) return 0;
    
    // Simple logic: $10 per item
    const itemsList = items?.split(',') || [];
    return itemsList.length * 10;
  };

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
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    masterSchedule,
    stops,
    setStops,
    loading,
    isSaving,
    isSubmitting,
    error,
    formatDateForInput,
    handleScheduleDateChange,
    handleSave,
    handleSubmit,
    fetchScheduleDetails
  };
}
