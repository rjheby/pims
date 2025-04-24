
import React from "react";
import { DispatchScheduleContent } from "./dispatch/components/DispatchScheduleContent";

export default function DispatchSchedule() {
  // Pass empty arrays and function to meet props requirements
  return (
    <DispatchScheduleContent
      schedules={[]}
      loading={false}
      onRefresh={() => {}}
    />
  );
}
