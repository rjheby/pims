
import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryStop } from './stops/types';
import { StopCard } from './StopCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeWindowGroupsProps {
  stops: DeliveryStop[];
  onEditStop?: (index: number) => void;
  onViewStop?: (stop: DeliveryStop) => void;
}

export const TimeWindowGroups: React.FC<TimeWindowGroupsProps> = ({
  stops,
  onEditStop,
  onViewStop
}) => {
  const [timeGroups, setTimeGroups] = useState<{
    morning: DeliveryStop[];
    afternoon: DeliveryStop[];
    evening: DeliveryStop[];
    anytime: DeliveryStop[];
  }>({
    morning: [],
    afternoon: [],
    evening: [],
    anytime: []
  });

  useEffect(() => {
    groupStopsByTimeWindow();
  }, [stops]);

  const groupStopsByTimeWindow = () => {
    const morning: DeliveryStop[] = [];
    const afternoon: DeliveryStop[] = [];
    const evening: DeliveryStop[] = [];
    const anytime: DeliveryStop[] = [];

    stops.forEach(stop => {
      // Check if stop has a time_window property
      if (stop.time_window) {
        const startTime = stop.time_window.start;
        
        // Parse the start time as 24-hour format
        try {
          const parsedTime = parse(startTime, 'HH:mm', new Date());
          const hour = parsedTime.getHours();
          
          // Group by time of day
          if (hour < 12) {
            morning.push(stop);
          } else if (hour < 17) {
            afternoon.push(stop);
          } else {
            evening.push(stop);
          }
        } catch (e) {
          // If time parsing fails, add to anytime
          anytime.push(stop);
        }
      } else {
        // If no time window, add to anytime
        anytime.push(stop);
      }
    });

    setTimeGroups({
      morning,
      afternoon,
      evening,
      anytime
    });
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="all">
          All ({stops.length})
        </TabsTrigger>
        <TabsTrigger value="morning">
          Morning ({timeGroups.morning.length})
        </TabsTrigger>
        <TabsTrigger value="afternoon">
          Afternoon ({timeGroups.afternoon.length})
        </TabsTrigger>
        <TabsTrigger value="evening">
          Evening ({timeGroups.evening.length})
        </TabsTrigger>
        <TabsTrigger value="anytime">
          Anytime ({timeGroups.anytime.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {stops.map((stop, index) => (
              <StopCard
                key={stop.id || index}
                stop={stop}
                onEditClick={() => onEditStop && onEditStop(index)}
                onViewClick={() => onViewStop && onViewStop(stop)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="morning">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {timeGroups.morning.map((stop, index) => (
              <StopCard
                key={stop.id || index}
                stop={stop}
                onEditClick={() => onEditStop && onEditStop(
                  stops.findIndex(s => s.id === stop.id)
                )}
                onViewClick={() => onViewStop && onViewStop(stop)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="afternoon">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {timeGroups.afternoon.map((stop, index) => (
              <StopCard
                key={stop.id || index}
                stop={stop}
                onEditClick={() => onEditStop && onEditStop(
                  stops.findIndex(s => s.id === stop.id)
                )}
                onViewClick={() => onViewStop && onViewStop(stop)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="evening">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {timeGroups.evening.map((stop, index) => (
              <StopCard
                key={stop.id || index}
                stop={stop}
                onEditClick={() => onEditStop && onEditStop(
                  stops.findIndex(s => s.id === stop.id)
                )}
                onViewClick={() => onViewStop && onViewStop(stop)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="anytime">
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {timeGroups.anytime.map((stop, index) => (
              <StopCard
                key={stop.id || index}
                stop={stop}
                onEditClick={() => onEditStop && onEditStop(
                  stops.findIndex(s => s.id === stop.id)
                )}
                onViewClick={() => onViewStop && onViewStop(stop)}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
