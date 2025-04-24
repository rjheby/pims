import React from "react";
import { Card, Typography } from "antd";
import { DeliveryStop } from "./stops/types";
import { StopsTable } from "./StopsTable";

const { Title } = Typography;

interface TimeWindowGroupsProps {
  stops: DeliveryStop[];
}

export const TimeWindowGroups: React.FC<TimeWindowGroupsProps> = ({ stops }) => {
  const morningStops = stops.filter(
    (stop) => stop.time_window === "morning"
  );
  const afternoonStops = stops.filter(
    (stop) => stop.time_window === "afternoon"
  );
  const eveningStops = stops.filter(
    (stop) => stop.time_window === "evening"
  );

  return (
    <div className="space-y-6">
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