
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DriverAvailability {
  driver_id: string;
  driver_name: string;
  available: boolean;
  reason?: string;
  available_time_windows?: TimeWindow[];
}

export interface TimeWindow {
  start: string;
  end: string;
}

export function useDriverAvailability(date: string, driverIds: string[] = []) {
  const [availabilities, setAvailabilities] = useState<DriverAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    
    async function fetchAvailability() {
      try {
        setLoading(true);
        setError(null);
        
        // First, get all drivers if no specific IDs provided
        if (driverIds.length === 0) {
          const { data: driversData, error: driversError } = await supabase
            .from('drivers')
            .select('id, name, status')
            .eq('status', 'active');
            
          if (driversError) throw driversError;
          driverIds = driversData.map(driver => driver.id);
        }
        
        // For now, we'll simulate availability with the drivers table
        // In a real implementation, you would query a dedicated availability table
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, status')
          .in('id', driverIds);
          
        if (driversError) throw driversError;
        
        // Convert driver data to availability format
        // In a real implementation, this would merge with actual availability records
        const driverAvailabilities = driversData.map(driver => ({
          driver_id: driver.id,
          driver_name: driver.name,
          available: driver.status === 'active',
          reason: driver.status !== 'active' ? `Driver status: ${driver.status}` : undefined,
          available_time_windows: driver.status === 'active' ? [
            { start: '08:00', end: '17:00' } // Default work hours
          ] : []
        }));
        
        setAvailabilities(driverAvailabilities);
      } catch (error: any) {
        console.error("Error fetching driver availability:", error);
        setError(error.message || "Failed to fetch driver availability");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAvailability();
  }, [date, JSON.stringify(driverIds)]);
  
  // Helper functions
  const isDriverAvailable = (driverId: string): boolean => {
    const driverAvailability = availabilities.find(a => a.driver_id === driverId);
    return driverAvailability ? driverAvailability.available : false;
  };
  
  const getAvailableDrivers = (): DriverAvailability[] => {
    return availabilities.filter(a => a.available);
  };
  
  const getUnavailableDrivers = (): DriverAvailability[] => {
    return availabilities.filter(a => !a.available);
  };
  
  return {
    availabilities,
    loading,
    error,
    isDriverAvailable,
    getAvailableDrivers,
    getUnavailableDrivers
  };
}
