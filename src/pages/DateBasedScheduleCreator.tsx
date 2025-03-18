
import React from "react";
import { ScheduleCreator } from "./dispatch/components/ScheduleCreator";
import { DispatchScheduleProvider } from './dispatch/context/DispatchScheduleContext';

export default function DateBasedScheduleCreator() {
  return (
    <DispatchScheduleProvider>
      <ScheduleCreator />
    </DispatchScheduleProvider>
  );
}
