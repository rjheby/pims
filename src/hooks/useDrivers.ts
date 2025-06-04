
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  name: string;
  phone?: string;
  profile_id?: string;
  employment_type: string;
  hourly_rate?: number;
  commission_rate?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching drivers...");
      
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order('name');

      if (error) {
        console.error("Error fetching drivers:", error);
        toast({
          title: "Error",
          description: "Failed to load drivers",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Drivers data received:", data);
      setDrivers(data as Driver[] || []);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Something went wrong while loading drivers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addDriver = useCallback(async (driver: Omit<Driver, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding driver:", driver);
      
      const { data, error } = await supabase
        .from("drivers")
        .insert(driver)
        .select();

      if (error) {
        console.error("Error adding driver:", error);
        toast({
          title: "Error",
          description: "Failed to add driver",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Success",
        description: "Driver added successfully",
      });
      
      fetchDrivers();
      return { success: true, data };
    } catch (err) {
      console.error("Error in addDriver:", err);
      toast({
        title: "Error",
        description: "Something went wrong while adding driver",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  }, [fetchDrivers, toast]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    loading,
    fetchDrivers,
    addDriver
  };
}
