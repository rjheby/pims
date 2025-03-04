
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ArrowLeft, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { downloadSchedulePDF } from "@/utils/GenerateSchedulePDF";

interface Stop {
  id: string;
  customer_id: string;
  customer: {
    id: string;
    name: string;
    address: string;
  };
  items: string | null;
  notes: string | null;
  status: string;
  sequence: number;
  master_schedule_id: string;
}

interface ScheduleWithStops {
  id: string;
  schedule_number: string;
  schedule_date: string;
  stops: Stop[];
}

export default function DriverSchedule() {
  const { driver_id, date } = useParams<{ driver_id: string; date: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState<string>("");
  const [schedulesWithStops, setSchedulesWithStops] = useState<ScheduleWithStops[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDriverAndSchedules() {
      if (!driver_id || !date) {
        setError("Missing driver ID or date");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch driver info
        const { data: driverData, error: driverError } = await supabase
          .from("drivers")
          .select("name")
          .eq("id", driver_id)
          .single();
          
        if (driverError) {
          throw new Error("Driver not found");
        }
        
        setDriverName(driverData.name);
        
        // Find all stops assigned to this driver for the given date
        const { data: stopsData, error: stopsError } = await supabase
          .from("delivery_schedules")
          .select(`
            id,
            customer_id,
            items,
            notes,
            status,
            sequence,
            master_schedule_id,
            customers:customer_id(id, name, address)
          `)
          .eq("driver_id", driver_id);
          
        if (stopsError) {
          throw stopsError;
        }
        
        if (!stopsData || stopsData.length === 0) {
          setSchedulesWithStops([]);
          setLoading(false);
          return;
        }
        
        // Get all master schedules for these stops
        const masterScheduleIds = [...new Set(stopsData.map(stop => stop.master_schedule_id))];
        
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("dispatch_schedules")
          .select("*")
          .in("id", masterScheduleIds)
          .eq("schedule_date", date);
          
        if (schedulesError) {
          throw schedulesError;
        }
        
        // Combine schedules with their stops
        const schedulesWithStopsData = schedulesData.map(schedule => {
          const scheduleStops = stopsData
            .filter(stop => stop.master_schedule_id === schedule.id)
            .map(stop => ({
              ...stop,
              customer: stop.customers
            }))
            .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
            
          return {
            ...schedule,
            stops: scheduleStops
          };
        });
        
        setSchedulesWithStops(schedulesWithStopsData);
      } catch (error: any) {
        console.error("Error fetching driver schedules:", error);
        setError(error.message || "Failed to load driver schedule");
      } finally {
        setLoading(false);
      }
    }

    fetchDriverAndSchedules();
  }, [driver_id, date, toast]);

  const handleStatusChange = async (stopId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("delivery_schedules")
        .update({ status: newStatus })
        .eq("id", stopId);
        
      if (error) throw error;
      
      // Update local state
      setSchedulesWithStops(prev => 
        prev.map(schedule => ({
          ...schedule,
          stops: schedule.stops.map(stop => 
            stop.id === stopId ? { ...stop, status: newStatus } : stop
          )
        }))
      );
      
      toast({
        title: "Success",
        description: "Stop status updated"
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPdf = () => {
    if (schedulesWithStops.length === 0) {
      toast({
        title: "Error",
        description: "No schedules to download",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Combine all stops from all schedules for this driver
      const allStops = schedulesWithStops.flatMap(schedule => schedule.stops);
      
      // Create a single "schedule" for the PDF
      const combinedSchedule = {
        id: "driver-schedule",
        schedule_number: `Driver Schedule - ${date}`,
        schedule_date: date,
        status: "active",
        stops: allStops,
        driverName: driverName
      };
      
      downloadSchedulePDF(combinedSchedule, true);
      
      toast({
        title: "Success",
        description: "Driver schedule PDF downloaded"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const navigateToDate = (offsetDays: number) => {
    const currentDate = new Date(date || "");
    const newDate = format(addDays(currentDate, offsetDays), "yyyy-MM-dd");
    navigate(`/driver-schedule/${driver_id}/${newDate}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button asChild>
                <Link to="/drivers">Return to Drivers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedDate = date ? format(new Date(date), "EEEE, MMMM d, yyyy") : "Invalid date";
  const totalStops = schedulesWithStops.reduce((sum, schedule) => sum + schedule.stops.length, 0);

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/drivers" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Drivers
          </Link>
          <h1 className="text-3xl font-bold">{driverName}'s Schedule</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigateToDate(-1)}
          >
            Previous Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToDate(1)}
          >
            Next Day
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownloadPdf}
            disabled={totalStops === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Stops ({totalStops})</CardTitle>
        </CardHeader>
        <CardContent>
          {totalStops === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-1">No Deliveries Scheduled</h3>
              <p>There are no deliveries assigned to this driver for the selected date.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {schedulesWithStops.map((schedule) => (
                <div key={schedule.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      Schedule #{schedule.schedule_number}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                    >
                      <Link to={`/dispatch-form/${schedule.id}`}>
                        View Full Schedule
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stop #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedule.stops.map((stop, index) => (
                          <TableRow key={stop.id}>
                            <TableCell>{stop.sequence || index + 1}</TableCell>
                            <TableCell className="font-medium">{stop.customer?.name || "Unknown"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{stop.customer?.address || "No address"}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{stop.notes || "-"}</TableCell>
                            <TableCell>
                              <Select
                                value={stop.status}
                                onValueChange={(value) => handleStatusChange(stop.id, value)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Not Started</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
