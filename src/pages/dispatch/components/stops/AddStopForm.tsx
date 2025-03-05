
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Customer } from "@/pages/customers/types";
import { Driver, StopFormData } from "./types";

interface AddStopFormProps {
  customers: Customer[];
  drivers: Driver[];
  currentStop: StopFormData;
  onStopChange: (value: StopFormData) => void;
  onAddStop: () => void;
  readOnly?: boolean;
}

export function AddStopForm({
  customers,
  drivers,
  currentStop,
  onStopChange,
  onAddStop,
  readOnly = false
}: AddStopFormProps) {
  if (readOnly) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-6">
      <h3 className="text-lg font-medium">Add Delivery Stop</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          <Select 
            value={currentStop.customer_id} 
            onValueChange={(value) => onStopChange({ ...currentStop, customer_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Driver</Label>
          <Select 
            value={currentStop.driver_id} 
            onValueChange={(value) => onStopChange({ ...currentStop, driver_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Items</Label>
          <Input 
            placeholder="Enter delivery items..."
            value={currentStop.items}
            onChange={(e) => onStopChange({ ...currentStop, items: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Notes</Label>
          <Input 
            placeholder="Enter delivery notes or special instructions..."
            value={currentStop.notes}
            onChange={(e) => onStopChange({ ...currentStop, notes: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={onAddStop}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          disabled={!currentStop.customer_id}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Stop
        </Button>
      </div>
    </div>
  );
}
