
import React, { useState, useEffect } from "react";
import { Driver } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface DriverSelectorEnhancedProps {
  selectedDriverId: string | null;
  onDriverSelect: (driverId: string | null) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const DriverSelectorEnhanced: React.FC<DriverSelectorEnhancedProps> = ({
  selectedDriverId,
  onDriverSelect,
  label = "Assign Driver",
  required = false,
  className = ""
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, [retryCount]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection first with a timeout
      console.log("Testing Supabase connection...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const testConnection = await supabase.from('drivers').select('count', { count: 'exact', head: true });
        clearTimeout(timeoutId);
        
        if (testConnection.error) {
          throw new Error(`Connection error: ${testConnection.error.message}`);
        }
        
        console.log("Connection test passed");
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Connection timed out. Please check your network connection.');
        }
        throw error;
      }

      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name");
        
      if (error) throw error;
      
      // Map the database results to the Driver type
      const mappedDrivers: Driver[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        status: d.status || 'active',
        // Add other properties if needed
      }));
      
      setDrivers(mappedDrivers);
      
      // If we had an error before but now succeeded, show success toast
      if (retryCount > 0) {
        toast({
          title: "Connection restored",
          description: "Successfully loaded driver data",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
      setError(error.message);
      toast({
        title: "Error loading drivers",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Group drivers by status to show active drivers first
  const activeDrivers = drivers.filter(d => d.status === 'active' || !d.status);
  const inactiveDrivers = drivers.filter(d => d.status && d.status !== 'active');

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor="driver-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex items-center space-x-2 h-9 px-4 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading drivers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor="driver-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-red-500 flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Failed to load drivers: {error}</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              className="flex items-center"
            >
              <Loader2 className={`h-3 w-3 mr-1 ${retryCount > 0 && loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = "/driver-management"}
            >
              Manage Drivers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (drivers.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label htmlFor="driver-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-muted-foreground">
            No drivers available. Please add drivers in Driver Management.
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = "/driver-management"}
          >
            Go to Driver Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="driver-selector">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        value={selectedDriverId || ''} 
        onValueChange={(value) => onDriverSelect(value || null)}
      >
        <SelectTrigger id="driver-selector">
          <SelectValue placeholder="Select a driver" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Unassigned</SelectItem>
          
          {activeDrivers.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Active Drivers
              </div>
              {activeDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </>
          )}
          
          {inactiveDrivers.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Inactive Drivers
              </div>
              {inactiveDrivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  <div className="flex items-center">
                    <span>{driver.name}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {driver.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
