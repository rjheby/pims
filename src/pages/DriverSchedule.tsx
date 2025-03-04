
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isValid } from "date-fns";
import { 
  ChevronLeft, 
  Clock, 
  FileDown, 
  Loader2, 
  MapPin, 
  Package, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadSchedulePDF } from "@/utils/GenerateSchedulePDF";

export default function DriverSchedule() {
  const { driver_id, date } = useParams<{ driver_id: string; date: string }>();
  const { toast } = useToast();
  const [stops, setStops] = useState<any[]>([]);
  const [driverName, setDriverName] = useState("");
  const [loading, setLoading] = useState(true);
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);

  // Parse the date from URL parameter
  useEffect(() => {
    if (date) {
      const parsedDate = new Date(date);
      if (isValid(parsedDate)) {
        setScheduleDate(parsedDate);
      }
    }
  }, [date]);

  useEffect(() => {
    async function fetchDriverSchedule() {
      if (!driver_id || !scheduleDate) return;
      
      setLoading(true);
      try {
        // Get driver name (temporary mock data)
        // TODO: Replace with actual database query when driver table is implemented
        const driverNames: Record<string, string> = {
          "driver-1": "John Smith",
          "driver-2": "Maria Garcia",
          "driver-3": "Robert Johnson",
          "driver-4": "Sarah Lee",
        };
        
        setDriverName(driverNames[driver_id] || "Unknown Driver");
        
        // Format date for database query
        const formattedDate = scheduleDate.toISOString().split('T')[0];
        
        // Fetch all stops assigned to this driver for the specified date
        const { data, error } = await supabase
          .from("delivery_schedules")
          .select(`
            id, 
            customer_id, 
            driver_id, 
            items, 
            notes, 
            status,
            customers:customer_id(id, name, address)
          `)
          .eq("driver_id", driver_id)
          .eq("delivery_date", formattedDate);
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setStops(data);
        }
      } catch (error) {
        console.error("Error fetching driver schedule:", error);
        toast({
          title: "Error",
          description: "Failed to load driver schedule",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchDriverSchedule();
  }, [driver_id, scheduleDate, toast]);

  const updateStopStatus = async (stopId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("delivery_schedules")
        .update({ status: newStatus })
        .eq("id", stopId);
        
      if (error) throw error;
      
      // Update local state
      setStops(stops.map(stop => 
        stop.id === stopId ? { ...stop, status: newStatus } : stop
      ));
      
      toast({
        title: "Status Updated",
        description: `Stop marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating stop status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };
  
  const handleDownloadPdf = () => {
    try {
      if (!scheduleDate || stops.length === 0) return;
      
      const scheduleForPdf = {
        schedule_number: `Driver Schedule - ${driverName}`,
        schedule_date: scheduleDate.toISOString(),
        stops: stops
      };
      
      downloadSchedulePDF(scheduleForPdf);
      
      toast({
        title: "Success",
        description: "Driver schedule PDF downloaded",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "submitted":
        return <Badge className="bg-amber-500"><AlertCircle className="h-3 w-3 mr-1" /> Assigned</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const formattedDate = scheduleDate ? format(scheduleDate, "EEEE, MMMM d, yyyy") : "Invalid Date";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" asChild className="mb-2">
            <Link to="/drivers">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Drivers
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{driverName}'s Schedule</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        
        <Button variant="outline" onClick={handleDownloadPdf} disabled={stops.length === 0}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Delivery Stops for {formattedDate}</CardTitle>
          <CardDescription>
            {stops.length} {stops.length === 1 ? 'stop' : 'stops'} assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No stops assigned for this day</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stops.map((stop, index) => (
                    <TableRow key={stop.id} className="group">
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {stop.customers?.name || "Unknown Customer"}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="line-clamp-2">{stop.customers?.address || "No address"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-1">
                          <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="line-clamp-2">{stop.items || "No items"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="line-clamp-2">{stop.notes || "—"}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(stop.status)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={stop.status}
                          onValueChange={(value) => updateStopStatus(stop.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Assigned</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
