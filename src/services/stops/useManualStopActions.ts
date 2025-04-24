
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DeliveryStop, DeliveryStatus } from '@/types';

interface ManualStopActionsProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  masterScheduleId?: string;
}

export const useManualStopActions = ({
  stops,
  onStopsChange,
  masterScheduleId
}: ManualStopActionsProps) => {
  
  // Add a manual stop with required fields
  const addManualStop = useCallback(
    (
      customerId: string,
      customerName: string,
      customerAddress: string,
      customerPhone: string,
      items: string
    ): boolean => {
      try {
        // Create a new stop with required fields
        const newStop: DeliveryStop = {
          id: uuidv4(), // Generate temporary ID
          stop_number: stops.length + 1,
          client_id: customerId,
          customer_name: customerName,
          customer_address: customerAddress,
          customer_phone: customerPhone,
          driver_id: undefined,
          driver_name: "",
          items: items,
          notes: "",
          status: "PENDING" as DeliveryStatus,
          is_recurring: false,
          master_schedule_id: masterScheduleId
        };

        // Add the new stop to the list
        onStopsChange([...stops, newStop]);
        return true;
      } catch (error) {
        console.error("Error adding manual stop:", error);
        return false;
      }
    },
    [stops, onStopsChange, masterScheduleId]
  );

  return {
    addManualStop
  };
};
