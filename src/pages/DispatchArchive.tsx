
import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  Loader2, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Package,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DispatchList } from "./dispatch/components";
import { generateDispatchPDF } from "./dispatch/utils/pdfGenerator";
import { DeliveryStop, DELIVERY_STATUS_OPTIONS } from "./dispatch/components/stops/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DispatchSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ScheduleGroup {
  title: string;
  schedules: DispatchSchedule[];
}

export default function DispatchArchive() {
  const [schedules, setSchedules] = useState<DispatchSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [grouping, setGrouping] = useState<"date" | "driver">("date");

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
      // Start by creating a duplicate of the schedule
      const { id, created_at, updated_at, schedule_number, ...scheduleData } = schedule;
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
        .single();

      if (error) throw error;
      if (!newSchedule) throw new Error("Failed to create new schedule");

      // Fetch all stops for this master schedule
      const { data: stopsData, error: stopsError } = await supabase
        .from("delivery_stops")
        .select("*")
        .eq("master_schedule_id", id);

      if (stopsError) throw stopsError;

      if (stopsData && stopsData.length > 0) {
        // Create new stops with the new master_schedule_id
        const newStops = stopsData.map((stop: DeliveryStop) => {
          const { id: stopId, created_at, updated_at, ...stopData } = stop;
          return {
            ...stopData,
            master_schedule_id: newSchedule.id,
            created_at: today,
            updated_at: today,
            status: 'pending' // Reset status for the new stops
          };
        });

        const { error: newStopsError } = await supabase
          .from("delivery_stops")
          .insert(newStops);

        if (newStopsError) throw newStopsError;
      }

      toast({
        title: "Schedule duplicated",
        description: "The schedule has been duplicated successfully with all stops."
      });

      // Refresh the schedules list
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
          id, customer_id, driver_id, items, notes, stop_number, price, status,
          customers:customer_id (name, address, phone),
          drivers:driver_id (name)
        `)
        .eq("master_schedule_id", schedule.id);

      if (stopsError) throw stopsError;

      const formattedStops = stops?.map((stop) => ({
        stop_number: stop.stop_number,
        customer_name: stop.customers?.name || "N/A",
        customer_address: stop.customers?.address || "N/A",
        driver_name: stop.drivers?.name || "Unassigned",
        items: stop.items,
        status: stop.status || "pending"
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
      // First delete all related stops
      const { error: stopsDeleteError } = await supabase
        .from("delivery_stops")
        .delete()
        .eq("master_schedule_id", scheduleId);

      if (stopsDeleteError) throw stopsDeleteError;

      // Then delete the schedule
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

  // Group schedules based on selected grouping
  const groupedSchedules = useMemo(() => {
    if (grouping === "date") {
      // Group by date (YYYY-MM-DD format)
      const groups: Record<string, DispatchSchedule[]> = {};
      
      schedules.forEach(schedule => {
        const dateKey = schedule.schedule_date.split('T')[0]; // Get just the date part
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(schedule);
      });
      
      // Convert to array and sort by date (newest first)
      return Object.entries(groups)
        .map(([date, schedules]) => ({
          title: format(new Date(date), "MMMM d, yyyy"),
          key: date,
          schedules
        }))
        .sort((a, b) => new Date(b.key).getTime() - new Date(a.key).getTime());
      
    } else if (grouping === "driver") {
      // For driver grouping, we need to fetch the stops with driver info
      // This is a placeholder for now - will need to fetch driver data first
      return [{
        title: "All Schedules",
        key: "all",
        schedules
      }];
    }
    
    return [{
      title: "All Schedules",
      key: "all",
      schedules
    }];
  }, [schedules, grouping]);

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispatch Archives</h1>
        <Link to="/dispatch-form">
          <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>All Schedules</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={grouping === "date" ? "default" : "outline"} 
                size="sm"
                onClick={() => setGrouping("date")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Group by Date
              </Button>
              <Button 
                variant={grouping === "driver" ? "default" : "outline"} 
                size="sm"
                onClick={() => setGrouping("driver")}
              >
                <Users className="mr-2 h-4 w-4" />
                Group by Driver
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {groupedSchedules.length > 0 ? (
                <Accordion 
                  type="multiple" 
                  className="space-y-4"
                  defaultValue={groupedSchedules.map(group => group.key)}
                >
                  {groupedSchedules.map((group) => (
                    <AccordionItem 
                      key={group.key} 
                      value={group.key}
                      className="border rounded-md overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 py-2 bg-slate-50 hover:bg-slate-100">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          <span>{group.title}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({group.schedules.length} {group.schedules.length === 1 ? 'schedule' : 'schedules'})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4">
                        <DispatchList
                          schedules={group.schedules}
                          onEdit={handleEditSchedule}
                          onDuplicate={handleDuplicateSchedule}
                          onDownload={handleDownloadSchedule}
                          onCopyLink={handleCopyLink}
                          onShare={handleShare}
                          onDelete={handleDeleteSchedule}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No dispatch schedules found. Create your first schedule to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
