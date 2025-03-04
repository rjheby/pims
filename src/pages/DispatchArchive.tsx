import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeliverySchedule {
  id: string;
  schedule_number: string;
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

export default function DispatchArchive() {
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispatch Schedule Archive</h1>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Schedule #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.schedule_number}</TableCell>
                      <TableCell>{schedule.schedule_date ? format(new Date(schedule.schedule_date), "MMM d, yyyy") : 'No Date'}</TableCell>
                      <TableCell>{schedule.schedule_type}</TableCell>
                      <TableCell>{schedule.status}</TableCell>
                      <TableCell>{format(new Date(schedule.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="secondary" size="sm">
                          <Link to={`/dispatch-form/${schedule.id}`}>View</Link>
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
