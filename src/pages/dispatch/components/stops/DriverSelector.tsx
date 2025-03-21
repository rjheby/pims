
import React from "react";
import { Driver } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DriverSelectorProps {
  drivers: Driver[];
  selectedDriverId: string | null;
  onDriverSelect: (driverId: string | null) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const DriverSelector: React.FC<DriverSelectorProps> = ({
  drivers,
  selectedDriverId,
  onDriverSelect,
  label = "Assign Driver",
  required = false,
  className = ""
}) => {
  // Group drivers by status to show active drivers first
  const activeDrivers = drivers.filter(d => d.status === 'active' || !d.status);
  const inactiveDrivers = drivers.filter(d => d.status && d.status !== 'active');

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
