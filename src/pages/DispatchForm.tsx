
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Bug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StopsTable } from "./dispatch/components"; 
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { downloadSchedulePDF } from "@/utils/GenerateSchedulePDF";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDispatchForm } from "./dispatch/hooks/useDispatchForm";
import { calculateTotals, calculateInventoryTotals } from "./dispatch/utils/inventoryUtils";
import { InventorySummary } from "./dispatch/components/InventorySummary";
import { useEffect, useState } from "react";
import { Customer, Driver } from "./dispatch/components/stops/types";
import { useAdmin } from "@/context/AdminContext";

export default function DispatchForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const { isAdmin } = useAdmin();
  
  console.log(`DispatchForm rendering with ID: ${id}, isMobile: ${isMobile}, isAdmin: ${isAdmin}`);
  
  const {
    masterSchedule,
    stops,
    setStops,
    loading,
    isSaving,
    isSubmitting,
    error,
    formatDateForInput,
    handleScheduleDateChange,
    handleSave,
    handleSubmit
  } = useDispatchForm(id);

  // Log whenever stops or masterSchedule changes
  useEffect(() => {
    if (debugMode) {
      console.log("DispatchForm: masterSchedule updated:", masterSchedule);
    }
  }, [masterSchedule, debugMode]);

  useEffect(() => {
    if (debugMode) {
      console.log("DispatchForm: stops updated:", stops);
      console.log(`Total stops: ${stops?.length || 0}, with itemsData: ${stops?.filter(s => Array.isArray(s.itemsData))?.length || 0}`);
    }
  }, [stops, debugMode]);

  useEffect(() => {
    async function fetchCustomersAndDrivers() {
      console.log("DispatchForm: Fetching customers and drivers...");
      try {
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
          .order('name');
          
        if (customersError) {
          console.error("Error fetching customers:", customersError);
          throw customersError;
        }
        
        console.log(`DispatchForm: Loaded ${customersData?.length || 0} customers`);
        setCustomers(customersData || []);
        
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, phone, email, status')
          .order('name');
          
        if (driversError) {
          console.error("Error fetching drivers:", driversError);
          throw driversError;
        }
        
        console.log(`DispatchForm: Loaded ${driversData?.length || 0} drivers`);
        setDrivers(driversData || []);
      } catch (error) {
        console.error("DispatchForm: Error in fetchCustomersAndDrivers:", error);
      }
    }
    
    fetchCustomersAndDrivers();
  }, []);

  const handleDownloadPdf = () => {
    console.log("DispatchForm: Generating PDF...");
    if (!masterSchedule) {
      console.error("DispatchForm: Cannot generate PDF - masterSchedule is null");
      return;
    }
    
    try {
      const scheduleForPdf = {
        ...masterSchedule,
        stops: stops.map(stop => ({
          ...stop,
          customer: stop.customers
        }))
      };
      
      console.log("DispatchForm: PDF data prepared:", scheduleForPdf);
      downloadSchedulePDF(scheduleForPdf);
      
      toast({
        title: "Success",
        description: "PDF generated successfully",
      });
    } catch (error) {
      console.error('DispatchForm: Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const toggleDebugMode = () => {
    const newMode = !debugMode;
    console.log(`DispatchForm: ${newMode ? 'Enabling' : 'Disabling'} debug mode`);
    setDebugMode(newMode);
    toast({
      title: newMode ? "Debug Mode Enabled" : "Debug Mode Disabled",
      description: newMode ? "Detailed logging is now active" : "Detailed logging is now inactive",
    });
  };

  if (loading) {
    console.log("DispatchForm: Still loading...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !masterSchedule) {
    console.error("DispatchForm: Error or no masterSchedule:", error);
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

  console.log(`DispatchForm: Ready to render. Status: ${masterSchedule.status}, Date: ${formattedDate}`);

  const renderInventorySummary = () => {
    if (debugMode) console.log("DispatchForm: Calculating inventory totals");
    const inventoryTotals = calculateInventoryTotals(stops);
    return <InventorySummary inventoryTotals={inventoryTotals} />;
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dispatch Schedule #{masterSchedule.schedule_number}</CardTitle>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleDebugMode}
                  className={debugMode ? "bg-yellow-100 border-yellow-400" : ""}
                >
                  <Bug className="h-4 w-4 mr-2" />
                  {debugMode ? "Disable Debug" : "Debug Mode"}
                </Button>
              )}
              {isSubmitted && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {debugMode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                <h3 className="font-semibold mb-1">Debug Information:</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Schedule ID: {id}</li>
                  <li>Schedule Number: {masterSchedule.schedule_number}</li>
                  <li>Status: {masterSchedule.status}</li>
                  <li>Total Stops: {stops?.length || 0}</li>
                  <li>Customers Loaded: {customers?.length || 0}</li>
                  <li>Drivers Loaded: {drivers?.length || 0}</li>
                  <li>View: {isMobile ? 'Mobile' : 'Desktop'}</li>
                </ul>
              </div>
            )}
            
            <BaseOrderDetails
              orderNumber={masterSchedule.schedule_number}
              orderDate={formattedDate}
              deliveryDate={formattedDate}
              onOrderDateChange={handleScheduleDateChange}
              onDeliveryDateChange={handleScheduleDateChange}
              disabled={isSubmitted}
            />
            
            <StopsTable 
              stops={stops} 
              onStopsChange={setStops}
              useMobileLayout={isMobile}
              readOnly={isSubmitted}
              masterScheduleId={id || ''} 
              customers={customers}
              drivers={drivers}
              debugMode={debugMode}
            />

            <BaseOrderSummary 
              items={calculateTotals(stops)}
              renderCustomSummary={renderInventorySummary}
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
                mobileLayout={isMobile}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
