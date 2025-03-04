
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface DeliverySchedule {
  id: string;
  customer_id: string;
  schedule_type: "one-time" | "recurring" | "bi-weekly";
  recurring_day: string | null;
  delivery_date: string | null;
  notes: string | null;
  driver_id: string | null;
  items: string | null;
  status: string;
  created_at: string;
  customer_name?: string;
  driver_name?: string;
}

export default function DispatchArchive() {
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        
        // Fetch delivery schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("delivery_schedules")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (schedulesError) {
          throw schedulesError;
        }

        if (!schedulesData) {
          setSchedules([]);
          return;
        }

        // Get all unique customer IDs
        const customerIds = [...new Set(schedulesData.map(schedule => schedule.customer_id))];
        
        // Fetch customer details
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, name")
          .in("id", customerIds);
        
        if (customersError) {
          throw customersError;
        }

        // Map customer names to schedules
        const schedulesWithCustomers = schedulesData.map(schedule => {
          const customer = customersData?.find(c => c.id === schedule.customer_id);
          return {
            ...schedule,
            customer_name: customer?.name || "Unknown Customer",
            driver_name: getDriverNameById(schedule.driver_id)
          };
        });
        
        setSchedules(schedulesWithCustomers);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast({
          title: "Error",
          description: "Failed to load delivery schedules",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [toast]);

  // Temporary function to get driver name until we have a drivers table
  function getDriverNameById(driverId: string | null): string {
    if (!driverId) return "Not Assigned";
    
    const driverMap: Record<string, string> = {
      "driver-1": "John Smith",
      "driver-2": "Maria Garcia",
      "driver-3": "Robert Johnson",
      "driver-4": "Sarah Lee",
    };
    
    return driverMap[driverId] || "Unknown Driver";
  }

  // Format the recurring day or date for display
  function formatScheduleDate(schedule: DeliverySchedule): string {
    if (schedule.schedule_type === "one-time" && schedule.delivery_date) {
      try {
        return format(new Date(schedule.delivery_date), "MMM d, yyyy");
      } catch (error) {
        return schedule.delivery_date || "No date";
      }
    }
    
    if (schedule.recurring_day) {
      const day = schedule.recurring_day.split("-")[0];
      return schedule.schedule_type === "recurring" 
        ? `Every ${day.charAt(0).toUpperCase() + day.slice(1)}` 
        : `Every Other ${day.charAt(0).toUpperCase() + day.slice(1)}`;
    }
    
    return "No schedule set";
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Delivery Schedules Archive</h1>
        <Button asChild variant="outline">
          <Link to="/dispatch">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dispatch
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Delivery Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No delivery schedules found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Customer</TableHead>
                    <TableHead className="text-center">Schedule</TableHead>
                    <TableHead className="text-center">Driver</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-center">Notes</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="text-center font-medium">{schedule.customer_name}</TableCell>
                      <TableCell className="text-center">{formatScheduleDate(schedule)}</TableCell>
                      <TableCell className="text-center">{schedule.driver_name}</TableCell>
                      <TableCell className="text-center">{schedule.items || "-"}</TableCell>
                      <TableCell className="text-center max-w-[200px] truncate">{schedule.notes || "-"}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          schedule.status === "submitted" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {schedule.status === "submitted" ? "Submitted" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(schedule.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dispatch-detail/${schedule.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
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
