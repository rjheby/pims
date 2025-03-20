
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
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
import { AuthGuard } from "@/components/AuthGuard";

export default function DispatchForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
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

  useEffect(() => {
    async function fetchCustomersAndDrivers() {
      try {
        console.log("DispatchForm: Fetching customers and drivers");
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
          .order('name');
          
        if (customersError) {
          console.error("Error fetching customers:", customersError);
          toast({
            title: "Error",
            description: `Failed to fetch customers: ${customersError.message}`,
            variant: "destructive"
          });
          return;
        }
        
        console.log(`DispatchForm: Fetched ${customersData?.length || 0} customers`);
        
        const processedCustomers = customersData.map(customer => ({
          ...customer,
          type: customer.type || 'RETAIL',
          address: customer.address || constructAddress(customer)
        }));
        
        setCustomers(processedCustomers);
        
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, phone, email, status')
          .order('name');
          
        if (driversError) {
          console.error("Error fetching drivers:", driversError);
          toast({
            title: "Error",
            description: `Failed to fetch drivers: ${driversError.message}`,
            variant: "destructive"
          });
          return;
        }
        
        console.log("Loaded drivers:", driversData?.length || 0);
        setDrivers(driversData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching data",
          variant: "destructive"
        });
      }
    }
    
    fetchCustomersAndDrivers();
  }, [toast]);
  
  const constructAddress = (customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
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

  return (
    <AuthGuard requiredRole="driver">
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error || !masterSchedule ? (
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
      ) : (
        <div className="flex-1">
          <Card className="shadow-sm mb-24 md:mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Dispatch Schedule #{masterSchedule.schedule_number}</CardTitle>
                {masterSchedule.status === 'submitted' && (
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
                  orderDate={formatDateForInput(masterSchedule.schedule_date)}
                  deliveryDate={formatDateForInput(masterSchedule.schedule_date)}
                  onOrderDateChange={handleScheduleDateChange}
                  onDeliveryDateChange={handleScheduleDateChange}
                  disabled={masterSchedule.status === 'submitted'}
                />
                
                <StopsTable 
                  stops={stops} 
                  onStopsChange={setStops}
                  useMobileLayout={isMobile}
                  readOnly={masterSchedule.status === 'submitted'}
                  masterScheduleId={id || ''} 
                  customers={customers}
                  drivers={drivers}
                />

                <BaseOrderSummary 
                  items={calculateTotals(stops)}
                  renderCustomSummary={() => (
                    <InventorySummary inventoryTotals={calculateInventoryTotals(stops)} />
                  )}
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
                    submitLabel={masterSchedule.status === 'submitted' ? "Update Submitted Schedule" : "Submit Schedule"}
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
      )}
    </AuthGuard>
  );
}
