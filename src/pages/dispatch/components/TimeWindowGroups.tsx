
import React from "react";
import { Card, Typography } from "antd";
import { DeliveryStop } from "./stops/types";
import { StopsTable } from "./StopsTable";

const { Title } = Typography;

interface TimeWindowGroupsProps {
  stops: DeliveryStop[];
}

export const TimeWindowGroups: React.FC<TimeWindowGroupsProps> = ({ stops }) => {
  const unscheduledStops = stops.filter(
    (stop) => !stop.master_schedule_id
  );
  const morningStops = stops.filter(
    (stop) => stop.time_window === "morning" && stop.master_schedule_id
  );
  const afternoonStops = stops.filter(
    (stop) => stop.time_window === "afternoon" && stop.master_schedule_id
  );
  const eveningStops = stops.filter(
    (stop) => stop.time_window === "evening" && stop.master_schedule_id
  );

  return (
    <div className="space-y-6">
      {unscheduledStops.length > 0 && (
        <Card className="border-2 border-dashed border-yellow-500/50">
          <Title level={4} className="flex items-center gap-2">
            <span className="text-yellow-600">Unscheduled Orders</span>
            <span className="text-sm font-normal text-muted-foreground">
              ({unscheduledStops.length} orders)
            </span>
          </Title>
          <StopsTable
            stops={unscheduledStops}
            onStopsChange={() => {}}
            useMobileLayout={false}
          />
        </Card>
      )}

      <Card>
        <Title level={4}>Morning Stops (6:00 AM - 11:59 AM)</Title>
        <StopsTable
          stops={morningStops}
          onStopsChange={() => {}}
          useMobileLayout={false}
        />
      </Card>

      <Card>
        <Title level={4}>Afternoon Stops (12:00 PM - 4:59 PM)</Title>
        <StopsTable
          stops={afternoonStops}
          onStopsChange={() => {}}
          useMobileLayout={false}
        />
      </Card>

      <Card>
        <Title level={4}>Evening Stops (5:00 PM - 9:00 PM)</Title>
        <StopsTable
          stops={eveningStops}
          onStopsChange={() => {}}
          useMobileLayout={false}
        />
      </Card>
    </div>
  );
};
