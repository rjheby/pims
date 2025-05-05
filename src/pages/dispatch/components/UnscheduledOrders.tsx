
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, User, FileText, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DeliveryStop, Customer, Driver, getStatusBadgeVariant } from './stops/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UnscheduledOrdersProps {
  onAddToSchedule: (stops: DeliveryStop[]) => void;
  currentScheduleId?: string;
  scheduleDate?: string;
}

export const UnscheduledOrders: React.FC<UnscheduledOrdersProps> = ({
  onAddToSchedule,
  currentScheduleId,
  scheduleDate
}) => {
  const [unscheduledStops, setUnscheduledStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUnscheduledStops();
  }, []);

  const fetchUnscheduledStops = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('delivery_stops')
        .select(`
          *,
          customer:customer_id (id, name, address, phone, email),
          driver:driver_id (id, name)
        `)
        .eq('scheduling_status', 'unscheduled')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched unscheduled stops:', data);
      setUnscheduledStops(data || []);
    } catch (error: any) {
      console.error('Error fetching unscheduled stops:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: `Failed to load unscheduled orders: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    // This will be implemented when we connect this to the schedule
    console.log('Drag ended:', result);
    // For now, just log the drag operation
  };

  const handleSelectStop = (stopId: string) => {
    setSelectedStops(prev => {
      if (prev.includes(stopId)) {
        return prev.filter(id => id !== stopId);
      } else {
        return [...prev, stopId];
      }
    });
  };

  const handleAddToSchedule = async () => {
    if (selectedStops.length === 0) {
      toast({
        title: 'No Stops Selected',
        description: 'Please select at least one order to add to the schedule.',
        variant: 'default'
      });
      return;
    }

    if (!currentScheduleId) {
      toast({
        title: 'Error',
        description: 'No active schedule selected.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Filter the selected stops
      const stopsToAdd = unscheduledStops.filter(stop => 
        selectedStops.includes(stop.id || '')
      );

      // Update the scheduling status in the database
      for (const stop of stopsToAdd) {
        const { error } = await supabase
          .from('delivery_stops')
          .update({ 
            scheduling_status: 'scheduled',
            master_schedule_id: currentScheduleId
          })
          .eq('id', stop.id);

        if (error) throw error;
      }

      // Call the callback to add stops to the current schedule
      onAddToSchedule(stopsToAdd);

      // Update local state by removing added stops
      setUnscheduledStops(prev => 
        prev.filter(stop => !selectedStops.includes(stop.id || ''))
      );

      // Clear selection
      setSelectedStops([]);

      toast({
        title: 'Success',
        description: `Added ${stopsToAdd.length} stops to the schedule.`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error adding stops to schedule:', error);
      toast({
        title: 'Error',
        description: `Failed to add stops to schedule: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = () => {
    fetchUnscheduledStops();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Unscheduled Orders</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh
            </Button>
            {selectedStops.length > 0 && currentScheduleId && (
              <Button 
                size="sm" 
                onClick={handleAddToSchedule}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                Add to Schedule ({selectedStops.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : unscheduledStops.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No unscheduled orders found.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="unscheduled-stops">
              {(provided) => (
                <ScrollArea className="h-[400px]">
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {unscheduledStops.map((stop, index) => (
                      <Draggable
                        key={stop.id}
                        draggableId={stop.id || `temp-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`border rounded-md p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                              selectedStops.includes(stop.id || '') ? 'border-primary bg-primary/5' : 'border-gray-200'
                            }`}
                            onClick={() => handleSelectStop(stop.id || '')}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">
                                {stop.customer_name || stop.customer?.name || 'No Customer'}
                              </div>
                              <Badge variant={getStatusBadgeVariant(stop.status || 'pending')}>
                                {stop.status || 'pending'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <User className="h-3.5 w-3.5 mr-1" />
                                <span>{stop.customer_name || stop.customer?.name || 'Unknown'}</span>
                              </div>
                              
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{scheduleDate || 'Not scheduled'}</span>
                              </div>
                              
                              {stop.notes && (
                                <div className="flex items-center text-muted-foreground col-span-2 truncate">
                                  <FileText className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                  <span className="truncate">{stop.notes}</span>
                                </div>
                              )}
                              
                              {stop.price && (
                                <div className="flex items-center text-muted-foreground">
                                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                                  <span>${Number(stop.price).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </ScrollArea>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};
