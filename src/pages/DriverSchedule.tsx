import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DriverStop {
  id: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string | null;
  items: string | null;
  notes: string | null;
  status: string;
  sequence: number;
}

export default function DriverSchedule() {
  const { driver_id, date } = useParams<{ driver_id: string; date: string }>();
  const [stops, setStops] = useState<DriverStop[]>([]);
  const [driverName, setDriverName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDriverSchedule() {
      if (!driver_id || !date) return;

      try {
        setLoading(true);
        
        // In a real implementation, fetch driver name from your drivers table
        // For now, using mock data
        const driverMap: Record<string, string> = {
          "driver-1": "John Smith",
          "driver-2": "Maria Garcia",
          "driver-3": "Robert Johnson",
          "driver-4": "Sarah Lee",
        };
        setDriverName(driverMap[driver_id] || "Unknown Driver");
        
        // Fetch all stops for this driver and date
        const { data, error } = await supabase
          .from("delivery_schedules")
          .select(`
            id, 
            notes, 
            items,
            status,
            customers(id, name, address, phone)
          `)
          .eq("driver_id", driver_id)
          .eq("delivery_date", date)
          .order('id');
        
        if (error) {
          throw error;
        }

        // Format stops with customer info
        const formattedStops = (data || []).map((stop, index) => ({
          id: stop.id,
          customer_name: stop.customers?.name || "Unknown Customer",
          customer_address: stop.customers?.address || "",
          customer_phone: stop.customers?.phone || null,
          items: stop.items,
          notes: stop.notes,
          status: stop.status,
          sequence: index + 1
        }));
        
        setStops(formattedStops);
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
  }, [driver_id, date, toast]);

  const handleToggleStatus = async (stopId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "submitted" ? "completed" : "submitted";
      
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
        description: `Delivery status changed to ${newStatus}`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formattedDate = date ? format(new Date(date), "MMMM d, yyyy") : "Invalid Date";

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{driverName}'s Schedule</h1>
        <Button asChild variant="outline">
          <Link to="/drivers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drivers
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Deliveries for {formattedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {stops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No deliveries scheduled for this date.
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop) => (
                <Card key={stop.id} className="overflow-hidden">
                  <div className={`w-full h-2 ${
                    stop.status === "completed" ? "bg-green-500" : "bg-amber-500"
                  }`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{stop.customer_name}</h3>
                        <p className="text-sm text
-muted-foreground mt-1 whitespace-pre-wrap">{stop.customer_address}</p>
                        {stop.customer_phone && (
                          <p className="text-sm mt-2">
                            <a href={`tel:${stop.customer_phone}`} className="text-blue-600">
                              {stop.customer_phone}
                            </a>
                          </p>
                        )}
                      </div>
                      <Button 
                        variant={stop.status === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleStatus(stop.id, stop.status)}
                        className={stop.status === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <CheckSquare className="mr-1 h-4 w-4" />
                        {stop.status === "completed" ? "Completed" : "Mark Complete"}
                      </Button>
                    </div>
                    
                    {stop.items && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium">Items:</h4>
                        <p className="text-sm whitespace-pre-wrap">{stop.items}</p>
                      </div>
                    )}
                    
                    {stop.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <h4 className="text-sm font-medium">Notes:</h4>
                        <p className="text-sm whitespace-pre-wrap">{stop.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
