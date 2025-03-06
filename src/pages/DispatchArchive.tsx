import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DispatchList } from "./dispatch/components";
import { generateDispatchPDF } from "./dispatch/utils/pdfGenerator";
import { DeliveryStop } from "./dispatch/components/stops/types";

interface DispatchSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function DispatchArchive() {
  const [schedules, setSchedules] = useState<DispatchSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("dispatch_schedules")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSchedules(data || []);
      } catch (error: any) {
        console.error("Error fetching schedules:", error);
        toast({
          title: "Error",
          description: "Failed to load schedules",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [toast]);

  const handleEditSchedule = (scheduleId: string) => {
    navigate(`/dispatch-form/${scheduleId}`);
  };

  const handleDuplicateSchedule = async (schedule: DispatchSchedule) => {
    try {
      const { id, created_at, schedule_number, ...scheduleData } = schedule;
      const today = new Date().toISOString();
      
      const newScheduleNumber = `${schedule_number}-COPY`;
      
      const { data: newSchedule, error } = await supabase
        .from("dispatch_schedules")
        .insert([{
          ...scheduleData,
          schedule_number: newScheduleNumber,
          status: 'draft',
          created_at: today,
          updated_at: today
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newSchedule) throw new Error("Failed to create new schedule");

      toast({
        title: "Schedule duplicated",
        description: "The schedule has been duplicated successfully."
      });

      const { data: stops, error: stopsError } = await supabase
        .from("delivery_stops")
        .select("*")
        .eq("master_schedule_id", id);

      if (stopsError) throw stopsError;

      if (stops && stops.length > 0) {
        const newStops = stops.map((stop: DeliveryStop) => {
          const { id: stopId, master_schedule_id, ...stopData } = stop;
          return {
            ...stopData,
            master_schedule_id: newSchedule.id
          };
        });

        const { error: newStopsError } = await supabase
          .from("delivery_stops")
          .insert(newStops);

        if (newStopsError) throw newStopsError;
      }

      const { data: refreshedData, error: refreshError } = await supabase
        .from("dispatch_schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (refreshError) throw refreshError;
      setSchedules(refreshedData || []);

      navigate(`/dispatch-form/${newSchedule.id}`);
    } catch (error) {
      console.error("Error duplicating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the schedule.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadSchedule = async (schedule: DispatchSchedule) => {
    try {
      const { data: stops, error: stopsError } = await supabase
        .from("delivery_stops")
        .select(`
          id, customer_id, driver_id, items, notes, stop_number, price,
          customers:customer_id (name, address, phone),
          drivers:driver_id (name, phone)
        `)
        .eq("master_schedule_id", schedule.id);

      if (stopsError) throw stopsError;

      const formattedStops = stops?.map((stop) => ({
        stop_number: stop.stop_number,
        customer_name: stop.customers?.name || "N/A",
        customer_address: stop.customers?.address || "N/A",
        driver_name: stop.drivers?.name || "Unassigned",
        items: stop.items
      })) || [];

      const pdf = generateDispatchPDF({
        schedule_number: schedule.schedule_number,
        schedule_date: schedule.schedule_date,
        notes: schedule.notes || undefined,
        status: schedule.status,
        stops: formattedStops
      });
      
      const fileName = `dispatch-schedule-${schedule.schedule_number}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Success",
        description: "Schedule PDF downloaded successfully."
      });
    } catch (error) {
      console.error("Error downloading schedule as PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (scheduleId: string) => {
    try {
      const link = `${window.location.origin}/dispatch-form/${scheduleId}`;
      navigator.clipboard.writeText(link);
      
      toast({
        title: "Link copied",
        description: "The shareable schedule link has been copied to your clipboard."
      });
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (scheduleId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/dispatch-form/${scheduleId}`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Dispatch Schedule Details&body=View the schedule details here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the dispatch schedule details here: ${link}`;
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error: stopsDeleteError } = await supabase
        .from("delivery_stops")
        .delete()
        .eq("master_schedule_id", scheduleId);

      if (stopsDeleteError) throw stopsDeleteError;

      const { error } = await supabase
        .from("dispatch_schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;

      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));

      toast({
        title: "Schedule deleted",
        description: "The schedule has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to delete the schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispatch Schedule Archive</h1>
        <Link to="/dispatch-form">
          <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DispatchList
              schedules={schedules}
              onEdit={handleEditSchedule}
              onDuplicate={handleDuplicateSchedule}
              onDownload={handleDownloadSchedule}
              onCopyLink={handleCopyLink}
              onShare={handleShare}
              onDelete={handleDeleteSchedule}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
