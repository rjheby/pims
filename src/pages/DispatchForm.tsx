
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { StopsTable } from "./components/StopsTable"; // Updated import
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { downloadSchedulePDF } from "@/utils/GenerateSchedulePDF";

// Renamed from DispatchDetail to DispatchForm for consistency
export default function DispatchForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [masterSchedule, setMasterSchedule] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // Fetch all stops for this master schedule
        const { data: stopsData, error: stopsError } = await supabase
          .from("delivery_schedules")
          .select(`
            id, 
            customer_id, 
            driver_id, 
            notes, 
            items,
            status,
            customers(id, name, address)
          `)
          .eq("master_schedule_id", id)
          .order('id');
        
        if (stopsError) {
          console.error("Error fetching stops:", stopsError);
        } else {
          setStops(stopsData || []);
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        setError("Failed to load schedule details");
      } finally {
        setLoading(false);
      }
    }

    fetchScheduleDetails();
  }, [id]);

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

  const calculateTotals = () => {
    const totalStops = stops.length;
    
    // Count stops by driver
    const totalByDriver = stops.reduce((acc: Record<string, number>, stop: any) => {
      const driverId = stop.driver_id || 'unassigned';
      acc[driverId] = (acc[driverId] || 0) + 1;
      return acc;
    }, {});

    return {
      totalQuantity: totalStops,
      quantityByPackaging: totalByDriver,
      totalValue: totalStops
    };
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
  
  const handleDownloadPdf = () => {
    if (!masterSchedule) return;
    
    try {
      const scheduleForPdf = {
        ...masterSchedule,
        stops: stops.map(stop => ({
          ...stop,
          customer: stop.customers
        }))
      };
      
      downloadSchedulePDF(scheduleForPdf);
      
      toast({
        title: "Success",
        description: "PDF generated successfully",
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !masterSchedule) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || "Schedule not found"}</p>
              <Button asChild>
                <Link to="/dispatch-archive">View All Schedules</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubmitted = masterSchedule.status === 'submitted';
  const actionLabel = isSubmitted ? "Update Submitted Schedule" : "Submit Schedule";
  const formattedDate = formatDateForInput(masterSchedule.schedule_date);

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dispatch Schedule #{masterSchedule.schedule_number}</CardTitle>
            {isSubmitted && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Submitted
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <BaseOrderDetails
              orderNumber={masterSchedule.schedule_number}
              orderDate={formattedDate}
              deliveryDate={formattedDate}
              onOrderDateChange={handleScheduleDateChange}
              onDeliveryDateChange={handleScheduleDateChange}
              disabled={isSubmitted}
            />
            
            {/* Display stops using the StopsTable component */}
            <StopsTable 
              stops={stops} 
              masterScheduleId={id || ''} 
              readOnly={isSubmitted} 
              onStopsChange={setStops}
            />

            <BaseOrderSummary 
              items={calculateTotals()}
            />

            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPdf}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              
              <BaseOrderActions
                onSave={handleSave}
                onSubmit={handleSubmit}
                submitLabel={actionLabel}
                archiveLink="/dispatch-archive"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
