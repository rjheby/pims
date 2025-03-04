import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, parseISO, isToday, isYesterday, isTomorrow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Filter, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { DispatchFilters } from "./dispatch/components/DispatchFilters";
import { downloadSchedulePDF } from "@/utils/GenerateSchedulePDF";

interface DeliverySchedule {
  id: number;
  customer_id: string;
  delivery_date: string;
  driver_id: string | null;
  items: string | null;
  notes: string | null;
  status: string;
  master_schedule_id: number;
  customers: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
}

export default function DispatchScheduleView() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>("today");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [schedules, setSchedules] = useState<DeliverySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: {
      from: null,
      to: null
    }
  });

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate, activeTab, filters]);

  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = addDays(today, 1);
    
    let startDate, endDate;
    
    if (filters.dateRange.from) {
      startDate = format(filters.dateRange.from, "yyyy-MM-dd");
      endDate = filters.dateRange.to 
        ? format(filters.dateRange.to, "yyyy-MM-dd") 
        : startDate;
      return { startDate, endDate };
    }
    
    switch (activeTab) {
      case "today":
        startDate = format(today, "yyyy-MM-dd");
        endDate = startDate;
        break;
      case "tomorrow":
        startDate = format(tomorrow, "yyyy-MM-dd");
        endDate = startDate;
        break;
      case "next7days":
        startDate = format(today, "yyyy-MM-dd");
        endDate = format(addDays(today, 6), "yyyy-MM-dd");
        break;
      case "custom":
        startDate = selectedDate;
        endDate = selectedDate;
        break;
      default:
        startDate = format(today, "yyyy-MM-dd");
        endDate = startDate;
    }
    
    return { startDate, endDate };
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = getDateRange();
      
      let query = supabase
        .from('delivery_schedules')
        .select(`
          *,
          customers(id, name, phone, address)
        `)
        .gte('delivery_date', startDate)
        .lte('delivery_date', endDate);
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Failed to fetch delivery schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isYesterday(date)) return "Yesterday";
      
      return format(date, "EEEE, MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setActiveTab("custom");
  };

  const handleCreateNew = () => {
    navigate('/dispatch');
  };

  const handleCreateDateSchedule = () => {
    navigate('/schedule-creator');
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleViewSchedule = (masterId: number) => {
    navigate(`/dispatch-form/${masterId}`);
  };

  const handleDownloadPDF = async (masterId: number) => {
    try {
      const { data: masterData, error: masterError } = await supabase
        .from('dispatch_schedules')
        .select('*')
        .eq('id', masterId)
        .single();
        
      if (masterError) throw masterError;
      
      const { data: stopsData, error: stopsError } = await supabase
        .from('delivery_schedules')
        .select(`
          *,
          customers(*)
        `)
        .eq('master_schedule_id', masterId);
        
      if (stopsError) throw stopsError;
      
      const scheduleForPdf = {
        ...masterData,
        stops: stopsData.map((stop: any) => ({
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

  const groupSchedulesByMaster = () => {
    const groupedSchedules: Record<number, DeliverySchedule[]> = {};
    
    schedules.forEach(schedule => {
      const masterId = schedule.master_schedule_id;
      if (!groupedSchedules[masterId]) {
        groupedSchedules[masterId] = [];
      }
      groupedSchedules[masterId].push(schedule);
    });
    
    return groupedSchedules;
  };

  const getUniqueDates = () => {
    const dates = new Set<string>();
    schedules.forEach(schedule => {
      dates.add(schedule.delivery_date);
    });
    return Array.from(dates).sort();
  };

  const TabButton = ({ 
    id, 
    label, 
    active 
  }: { 
    id: string; 
    label: string; 
    active: boolean 
  }) => (
    <Button
      variant={active ? "default" : "outline"}
      className={`${active ? "bg-[#2A4131]" : ""}`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </Button>
  );

  if (loading && schedules.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByMaster();
  const uniqueDates = getUniqueDates();

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dispatch Schedule View</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button 
                variant="outline"
                onClick={handleCreateDateSchedule}
                className="bg-white text-[#2A4131] border-[#2A4131] hover:bg-[#F2E9D2]"
              >
                <Clock className="mr-2 h-4 w-4" />
                Date Schedule
              </Button>
              <Button 
                onClick={handleCreateNew}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Schedule
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <TabButton id="today" label="Today" active={activeTab === "today"} />
              <TabButton id="tomorrow" label="Tomorrow" active={activeTab === "tomorrow"} />
              <TabButton id="next7days" label="Next 7 Days" active={activeTab === "next7days"} />
              
              <div className="flex items-center ml-auto">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div className="text-lg font-medium">
              {activeTab === "today" ? "Today's Deliveries" : 
               activeTab === "tomorrow" ? "Tomorrow's Deliveries" :
               activeTab === "next7days" ? "Deliveries for the Next 7 Days" :
               `Deliveries for ${formatDisplayDate(selectedDate)}`}
              
              {filters.status && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Filtered by status: {filters.status})
                </span>
              )}
            </div>
            
            {uniqueDates.length > 0 ? (
              <div className="space-y-8">
                {uniqueDates.map(date => (
                  <div key={date} className="space-y-4">
                    <h3 className="text-md font-semibold border-b pb-2">
                      {formatDisplayDate(date)}
                    </h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Client Phone</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schedules
                          .filter(schedule => schedule.delivery_date === date)
                          .map(schedule => (
                            <TableRow key={schedule.id}>
                              <TableCell className="font-medium">
                                {schedule.customers?.name || "Unknown"}
                              </TableCell>
                              <TableCell>
                                {schedule.customers?.phone || "-"}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {schedule.items || "-"}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {schedule.customers?.address || "-"}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                  schedule.status === "submitted" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {schedule.status === "submitted" ? "Submitted" : "Draft"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDownloadPDF(schedule.master_schedule_id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                                    onClick={() => handleViewSchedule(schedule.master_schedule_id)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border rounded-md">
                No deliveries scheduled for this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <DispatchFilters 
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
