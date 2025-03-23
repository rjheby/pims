
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format, isToday, parseISO, startOfWeek, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/AuthGuard";
import { checkRealtimeConnection } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { DispatchScheduleManager } from "./dispatch/components/DispatchScheduleManager";

export default function DispatchScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if the WebSocket connection is working
    const checkConnection = async () => {
      const isConnected = await checkRealtimeConnection();
      
      if (!isConnected) {
        setConnectionStatus("WebSocket connection failed. Using REST API fallback. Some real-time updates may not work.");
        
        toast({
          title: "Connection Warning",
          description: "WebSocket connection failed. Using REST API fallback.",
          variant: "default"
        });
      } else {
        setConnectionStatus(null);
      }
    };
    
    checkConnection();
  }, [toast]);
  
  // Check if date parameter is in the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const dateParam = params.get('date');
    
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error("Invalid date parameter:", error);
      }
    }
  }, [location.search]);
  
  // Update URL when selected date changes
  useEffect(() => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/dispatch-schedule?date=${dateString}`, { replace: true });
  }, [selectedDate, navigate]);
  
  const handlePreviousWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setWeekStart(newWeekStart);
  };
  
  const handleNextWeek = () => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setWeekStart(newWeekStart);
  };
  
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleCreateNew = () => {
    navigate('/dispatch-creator', { state: { selectedDate: selectedDate.toISOString() } });
  };
  
  // Create an array of dates for the week
  const weekDates = [...Array(7)].map((_, i) => {
    const date = addDays(weekStart, i);
    const isSelected = 
      date.getDate() === selectedDate.getDate() && 
      date.getMonth() === selectedDate.getMonth() && 
      date.getFullYear() === selectedDate.getFullYear();
      
    return { date, isSelected };
  });
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dispatch Schedule</h1>
            <p className="text-muted-foreground">View and manage delivery schedules</p>
          </div>
          
          <Button onClick={handleCreateNew} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
        
        {connectionStatus && (
          <Alert variant="warning">
            <AlertDescription>
              {connectionStatus}
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Calendar
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handlePreviousWeek}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleNextWeek}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDates.map(({ date, isSelected }) => (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "outline"}
                  className={`flex flex-col items-center py-3 h-auto
                    ${isToday(date) && !isSelected ? 'border-primary/40 text-primary' : ''}
                    ${isSelected ? 'bg-[#2A4131] hover:bg-[#2A4131]/90' : ''}
                  `}
                  onClick={() => handleDayClick(date)}
                >
                  <span className="text-xs font-normal mb-1">{format(date, 'E')}</span>
                  <span className="text-lg font-semibold mb-1">{format(date, 'd')}</span>
                  <span className="text-xs font-normal">{format(date, 'MMM')}</span>
                  
                  {isToday(date) && !isSelected && (
                    <Badge variant="outline" className="mt-1 bg-primary/10 text-primary text-xs px-1.5">
                      Today
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="mb-2">
              <h2 className="text-lg font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>
            
            <DispatchScheduleManager 
              selectedDate={selectedDate} 
              showFilters={false} 
            />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
