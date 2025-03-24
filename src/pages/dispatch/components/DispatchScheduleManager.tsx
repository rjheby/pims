import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, Plus, Calendar, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ScheduleCard } from "./ScheduleCard";
import { supabase, fetchWithFallback, handleSupabaseError } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { 
  findSchedulesForDate, 
  checkDateForRecurringOrders,
  syncAllRecurringOrders
} from "../utils/recurringOrderUtils";

interface DispatchSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  stops_count?: number;
  isRecurring?: boolean;
}

interface DispatchScheduleManagerProps {
  selectedDate?: Date;
  showFilters?: boolean;
}

export function DispatchScheduleManager({
  selectedDate,
  showFilters = true
}: DispatchScheduleManagerProps) {
  const [schedules, setSchedules] = useState<DispatchSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    dateRange: {
      from: null as Date | null,
      to: null as Date | null
    }
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load schedules based on selected date or filters
  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If a specific date is selected, use our specialized function to find
      // both regular and recurring schedules for that date
      if (selectedDate) {
        const schedulesWithRecurring = await findSchedulesForDate(selectedDate);
        
        // Fetch stop counts for each schedule
        const schedulesWithStops = await Promise.all(
          schedulesWithRecurring.map(async (schedule) => {
            try {
              const { data: stops, error: stopsError } = await supabase
                .from('delivery_stops')
                .select('id')
                .eq('master_schedule_id', schedule.id);
              
              if (stopsError) throw stopsError;
              
              return {
                ...schedule,
                stops_count: stops?.length || 0
              };
            } catch (error) {
              console.error(`Error fetching stops for schedule ${schedule.id}:`, error);
              return {
                ...schedule,
                stops_count: 0
              };
            }
          })
        );
        
        setSchedules(schedulesWithStops);
        setLoading(false);
        return;
      }
      
      // For archive view without a specific date, use the regular query
      let query = supabase
        .from('dispatch_schedules')
        .select(`
          *,
          stops:delivery_stops(count),
          recurring_schedules:recurring_order_schedules(recurring_order_id)
        `);
      
      // Apply status filter if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // Apply date range filters if provided
      if (filters.dateRange.from) {
        query = query.gte('schedule_date', filters.dateRange.from.toISOString().split('T')[0]);
      }
      
      if (filters.dateRange.to) {
        query = query.lte('schedule_date', filters.dateRange.to.toISOString().split('T')[0]);
      }
      
      // Order by date descending
      query = query.order('schedule_date', { ascending: false });
      
      // Execute the query using fetchWithFallback to handle WebSocket issues
      const { data, error } = await fetchWithFallback(
        'dispatch_schedules',
        () => query
      );
      
      if (error) throw error;
      
      console.log('Fetched schedules:', data);
      
      // Process the data to add convenience properties
      const processedData = (data || []).map(schedule => {
        // Determine if this is a recurring schedule
        const isRecurring = schedule.recurring_schedules && schedule.recurring_schedules.length > 0;
        
        // Get stops count 
        const stopsCount = schedule.stops?.length || 0;
        
        return {
          ...schedule,
          stops_count: stopsCount,
          isRecurring
        };
      });
      
      setSchedules(processedData);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(handleSupabaseError(error));
      toast({
        title: 'Error',
        description: `Failed to load schedules: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (scheduleId: string) => {
    navigate(`/dispatch-form/${scheduleId}`);
  };

  const handleDuplicateSchedule = async (schedule: DispatchSchedule) => {
    try {
      // Generate a new schedule number
      const scheduleNumber = `DS-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Insert the new schedule
      const { data: newSchedule, error: scheduleError } = await supabase
        .from('dispatch_schedules')
        .insert({
          schedule_date: schedule.schedule_date,
          schedule_number: scheduleNumber,
          notes: schedule.notes ? `Copy of: ${schedule.notes}` : 'Duplicated schedule',
          status: 'draft'
        })
        .select()
        .single();
      
      if (scheduleError) throw scheduleError;
      
      // Get stops from the original schedule
      const { data: stops, error: stopsError } = await supabase
        .from('delivery_stops')
        .select('*')
        .eq('master_schedule_id', schedule.id);
      
      if (stopsError) throw stopsError;
      
      // Duplicate the stops for the new schedule
      if (stops && stops.length > 0) {
        const newStops = stops.map(stop => ({
          ...stop,
          id: undefined, // Let Supabase generate a new ID
          master_schedule_id: newSchedule.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('delivery_stops')
          .insert(newStops);
        
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Schedule Duplicated',
        description: 'The schedule has been duplicated successfully.',
      });
      
      // Refresh the schedule list
      fetchSchedules();
      
    } catch (error) {
      console.error('Error duplicating schedule:', error);
      toast({
        title: 'Error',
        description: `Failed to duplicate schedule: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSchedule = async (schedule: DispatchSchedule) => {
    try {
      // Fetch all the stops for this schedule
      const { data: stops, error: stopsError } = await supabase
        .from('delivery_stops')
        .select(`
          *,
          customers:customer_id (name, address, phone)
        `)
        .eq('master_schedule_id', schedule.id)
        .order('stop_number', { ascending: true });
      
      if (stopsError) throw stopsError;
      
      // Check if this is a recurring schedule
      const { data: recurringInfo, error: recurringError } = await supabase
        .from('recurring_order_schedules')
        .select(`
          *,
          recurring_order:recurring_order_id (
            id, frequency, preferred_day, preferred_time,
            customer:customer_id (name)
          )
        `)
        .eq('schedule_id', schedule.id)
        .maybeSingle();
      
      if (recurringError) {
        console.warn('Error checking recurring status:', recurringError);
      }
      
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title and header information
      doc.setFontSize(20);
      doc.text('Dispatch Schedule', 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Schedule #: ${schedule.schedule_number}`, 14, 32);
      doc.text(`Date: ${format(new Date(schedule.schedule_date), 'MMMM d, yyyy')}`, 14, 39);
      doc.text(`Status: ${schedule.status.toUpperCase()}`, 14, 46);
      
      // Add recurring information if available
      let currentY = 53;
      if (recurringInfo && recurringInfo.recurring_order) {
        doc.text(`Recurring: ${recurringInfo.recurring_order.frequency} (${recurringInfo.recurring_order.preferred_day})`, 14, currentY);
        currentY += 7;
      }
      
      if (schedule.notes) {
        doc.text('Notes:', 14, currentY);
        doc.setFontSize(10);
        doc.text(schedule.notes, 14, currentY + 7, { maxWidth: 180 });
        currentY += 14;
      }
      
      // Add stops table
      const tableData = (stops || []).map(stop => [
        stop.stop_number || '',
        stop.customers?.name || stop.customer_name || 'Unknown',
        stop.customers?.address || stop.customer_address || '',
        stop.customers?.phone || stop.customer_phone || '',
        stop.status || 'Pending'
      ]);
      
      autoTable(doc, {
        head: [['Stop', 'Customer', 'Address', 'Phone', 'Status']],
        body: tableData,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [42, 65, 49] },
        styles: { fontSize: 10 }
      });
      
      // Save the PDF
      doc.save(`dispatch_schedule_${schedule.schedule_number}.pdf`);
      
      toast({
        title: 'Download Complete',
        description: 'Schedule PDF has been downloaded.',
      });
      
    } catch (error) {
      console.error('Error downloading schedule:', error);
      toast({
        title: 'Error',
        description: `Failed to download schedule: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (scheduleId: string) => {
    const link = `${window.location.origin}/dispatch-form/${scheduleId}`;
    navigator.clipboard.writeText(link);
  };

  const handleShare = (scheduleId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/dispatch-form/${scheduleId}`;
    
    if (method === 'email') {
      window.location.href = `mailto:?subject=Dispatch Schedule&body=View the dispatch schedule at ${link}`;
    } else {
      // For SMS, we use the SMS URI scheme
      window.location.href = `sms:?body=View the dispatch schedule at ${link}`;
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      // Check if this schedule is associated with recurring orders
      const { data: recurringLinks, error: recurringError } = await supabase
        .from('recurring_order_schedules')
        .select('id')
        .eq('schedule_id', scheduleId);
      
      if (recurringError) {
        console.warn('Error checking recurring links:', recurringError);
      } else if (recurringLinks && recurringLinks.length > 0) {
        // Delete the recurring order links first
        const { error: deleteLinksError } = await supabase
          .from('recurring_order_schedules')
          .delete()
          .eq('schedule_id', scheduleId);
        
        if (deleteLinksError) {
          console.warn('Error deleting recurring links:', deleteLinksError);
        }
      }
      
      // First delete all stops associated with this schedule
      const { error: stopsError } = await supabase
        .from('delivery_stops')
        .delete()
        .eq('master_schedule_id', scheduleId);
      
      if (stopsError) throw stopsError;
      
      // Now delete the schedule itself
      const { error } = await supabase
        .from('dispatch_schedules')
        .delete()
        .eq('id', scheduleId);
      
      if (error) throw error;
      
      // Update the local state to remove the deleted schedule
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      
      toast({
        title: 'Schedule Deleted',
        description: 'The schedule has been deleted successfully.',
      });
      
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: `Failed to delete schedule: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    }
  };

  // Filter the schedules based on search term
  const filteredSchedules = schedules.filter(schedule => 
    schedule.schedule_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (schedule.notes && schedule.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
    schedule.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    format(new Date(schedule.schedule_date), 'MMMM d, yyyy').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCreateSchedule = () => {
    if (selectedDate) {
      navigate('/dispatch-creator', { state: { selectedDate: selectedDate.toISOString() } });
    } else {
      navigate('/dispatch-creator');
    }
  };

  const handleRetry = () => {
    fetchSchedules();
  };

  // New function to sync all recurring orders
  const handleSyncRecurringOrders = async () => {
    try {
      setLoading(true);
      const result = await syncAllRecurringOrders();
      
      if (result.success) {
        toast({
          title: 'Recurring Orders Synced',
          description: `Successfully processed ${result.processed} recurring orders.`,
        });
        
        // Refresh the schedule list
        fetchSchedules();
      } else {
        toast({
          title: 'Error',
          description: `Failed to sync recurring orders: ${result.error}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error syncing recurring orders:', error);
      toast({
        title: 'Error',
        description: `Failed to sync recurring orders: ${handleSupabaseError(error)}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      {showFilters && (
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1.5 h-6 w-6 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSyncRecurringOrders}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Recurring Orders
            </Button>
            
            <Button 
              onClick={handleCreateSchedule}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>
        </div>
      )}

      {/* Error message if loading failed */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results count */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          {selectedDate && (
            <span className="font-medium">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}:
            </span>
          )}{" "}
          Showing {filteredSchedules.length} {filteredSchedules.length === 1 ? 'schedule' : 'schedules'}
          {searchTerm && <span> (search: "{searchTerm}")</span>}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Loading schedules...</p>
        </div>
      ) : filteredSchedules.length === 0 ? (
        // Empty state
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedules found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {selectedDate 
                ? `There are no delivery schedules for ${format(selectedDate, "MMMM d, yyyy")}.`
                : "No schedules match your search criteria."}
            </p>
            
            <div className="flex gap-2">
              {selectedDate && (
                <Button
                  onClick={handleSyncRecurringOrders}
                  variant="outline"
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Recurring Orders
                </Button>
              )}
              
              <Button 
                onClick={handleCreateSchedule}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Grid of schedule cards
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={{
                ...schedule,
                stops: schedule.stops_count
              }}
              onEdit={handleEditSchedule}
              onDuplicate={handleDuplicateSchedule}
              onDownload={handleDownloadSchedule}
              onCopyLink={handleCopyLink}
              onShare={handleShare}
              onDelete={handleDeleteSchedule}
              highlightTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
