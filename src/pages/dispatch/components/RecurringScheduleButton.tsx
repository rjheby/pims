import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { CalendarCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';

interface RecurringScheduleButtonProps {
  date: string;
  hasRecurringOrders: boolean;
}

export function RecurringScheduleButton({ date, hasRecurringOrders }: RecurringScheduleButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);

  // Function to check if a schedule already exists for this date
  const checkExistingSchedule = async (date: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('dispatch_schedules')
        .select('id')
        .eq('schedule_date', date)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error("Error checking for existing schedule:", error);
      return null;
    }
  };

  const handleCreateSchedule = async () => {
    if (!hasRecurringOrders) return;
    
    try {
      setCreating(true);
      
      // First check if a schedule already exists for this date
      const existingScheduleId = await checkExistingSchedule(date);
      
      if (existingScheduleId) {
        // If a schedule exists, navigate to it
        navigate(`/dispatch-form/${existingScheduleId}`);
        return;
      }
      
      // Otherwise create a new schedule and navigate to it
      navigate('/schedule-creator', { 
        state: { selectedDate: new Date(date).toISOString() } 
      });
    } catch (error) {
      console.error("Error handling schedule creation:", error);
      toast({
        title: "Error",
        description: "Failed to create or find schedule",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  if (!hasRecurringOrders) return null;

  return (
    <Button 
      size="sm"
      onClick={handleCreateSchedule}
      disabled={creating}
      className="bg-[#2A4131] hover:bg-[#2A4131]/90"
    >
      {creating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CalendarCheck className="mr-2 h-4 w-4" />
          Create Schedule with Recurring Orders
        </>
      )}
    </Button>
  );
}
