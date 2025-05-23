
import React from "react";
import { ScheduleCreator } from "./dispatch/components/ScheduleCreator";
import { DispatchScheduleProvider } from './dispatch/context/DispatchScheduleContext';

export default function DispatchDelivery() {
  return (
    <DispatchScheduleProvider>
      <ScheduleCreator />
    </DispatchScheduleProvider>
  );
}
