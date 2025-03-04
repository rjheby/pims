
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<DeliverySchedule | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchScheduleDetails() {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch delivery schedule
        const { data: scheduleData, error: scheduleError } = await supabase
          .from("delivery_schedules")
          .select("*")
          .eq("id", id)
          .single();
        
        if (scheduleError) {
          throw scheduleError;
        }

        if (!scheduleData) {
          toast({
            title: "Error",
            description: "Schedule not found",
            variant: "destructive"
          });
          return;
        }

        setSchedule(scheduleData);

        // Fetch customer details
        if (scheduleData.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", scheduleData.customer_id)
            .single();
          
          if (customerError) {
            console.error("Error fetching customer:", customerError);
          } else {
            setCustomer(customerData);
          }
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        toast({
          title: "Error",
          description: "Failed to load schedule details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleDetails();
  }, [id, toast]);

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
        return format(new Date(schedule.delivery_date), "MMMM d, yyyy");
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
        <h1 className="text-3xl font-bold">Delivery Schedule Details</h1>
        <Button asChild variant="outline">
          <Link to="/dispatch-archive">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schedules
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : schedule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Schedule Type</p>
                  <p className="mt-1">{schedule.schedule_type.charAt(0).toUpperCase() + schedule.schedule_type.slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Date</p>
                  <p className="mt-1">{formatScheduleDate(schedule)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs ${
                    schedule.status === "submitted" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {schedule.status === "submitted" ? "Submitted" : "Draft"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="mt-1">{format(new Date(schedule.created_at), "MMMM d, yyyy")}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Driver</p>
                  <p className="mt-1">{getDriverNameById(schedule.driver_id)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Items</p>
                  <p className="mt-1 whitespace-pre-wrap">{schedule.items || "No items specified"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap">{schedule.notes || "No notes"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="mt-1 font-medium">{customer.name}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="mt-1">{customer.phone || "No phone number"}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="mt-1">{customer.email || "No email"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="mt-1 whitespace-pre-wrap">{customer.address || "No address"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Customer information not available</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Schedule not found or has been removed.</p>
              <Button asChild className="mt-4">
                <Link to="/dispatch-archive">View All Schedules</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
