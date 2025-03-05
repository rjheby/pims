import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Trash, Edit, Check, X, Hash, CheckSquare, Square, Copy } from "lucide-react";
import { Customer } from "@/pages/customers/types";
import { Driver, DeliveryStop, StopFormData } from "./types";
import { calculatePrice } from "./utils";
import { Checkbox } from "@/components/ui/checkbox";

interface StopsMobileCardsProps {
  stops: DeliveryStop[];
  customers: Customer[];
  drivers: Driver[];
  editingIndex: number | null;
  editForm: StopFormData;
  onEditFormChange: (value: StopFormData) => void;
  onEditStart: (index: number) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onRemoveStop: (index: number) => void;
  readOnly?: boolean;
  selectedStops?: string[];
  onSelectStop?: (stopId: string, index: number, event?: React.MouseEvent) => void;
  onDuplicateStop?: (index: number) => void;
}

export function StopsMobileCards({
  stops,
  customers,
  drivers,
  editingIndex,
  editForm,
  onEditFormChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onRemoveStop,
  readOnly = false,
  selectedStops = [],
  onSelectStop,
  onDuplicateStop
}: StopsMobileCardsProps) {
  if (stops.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-md mb-6">
        No stops added yet. Add your first stop using the form above.
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mb-6">
      {stops.map((stop, index) => {
        const customer = customers.find(c => c.id === stop.customer_id);
        const driver = drivers.find(d => d.id === stop.driver_id);
        const isSelected = stop.id ? selectedStops.includes(stop.id.toString()) : false;
        
        if (editingIndex === index) {
          return (
            <Card key={`edit-${index}`} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[#2A4131] text-white p-3 flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    <div className="flex items-center space-x-2">
                      <Label className="text-white">Stop #</Label>
                      <div className="relative w-20">
                        <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-white">
                          <Hash className="h-4 w-4" />
                        </span>
                        <Input 
                          type="number"
                          min="1"
                          className="pl-8 bg-[#203324] text-white border-[#2A4131]"
                          value={editForm.stop_number || ''}
                          onChange={(e) => onEditFormChange({ 
                            ...editForm, 
                            stop_number: e.target.value ? parseInt(e.target.value, 10) : undefined 
                          })}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onEditSave}
                      className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onEditCancel}
                      className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Customer</Label>
                      <Select 
                        value={editForm.customer_id || ""} 
                        onValueChange={(value) => onEditFormChange({ ...editForm, customer_id: value })}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Driver</Label>
                      <Select 
                        value={editForm.driver_id || ""} 
                        onValueChange={(value) => onEditFormChange({ ...editForm, driver_id: value })}
                        disabled={readOnly}
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
                    
                    <div className="space-y-1">
                      <Label>Items</Label>
                      <Input 
                        value={editForm.items || ""}
                        onChange={(e) => onEditFormChange({ ...editForm, items: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Notes</Label>
                      <Textarea 
                        value={editForm.notes || ""}
                        onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                        disabled={readOnly}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <Card 
            key={index} 
            className={`overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}
          >
            <CardContent className="p-0">
              <div className="bg-[#2A4131] text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {!readOnly && onSelectStop && stop.id && (
                    <div onClick={(e) => onSelectStop(stop.id!.toString(), index, e)} className="cursor-pointer">
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-white" />
                      ) : (
                        <Square className="h-5 w-5 text-white" />
                      )}
                    </div>
                  )}
                  <div className="text-lg font-semibold">Stop #{stop.stop_number || index + 1}</div>
                </div>
                {!readOnly && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditStart(index)}
                      className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDuplicateStop && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDuplicateStop(index)}
                        className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onRemoveStop(index)}
                      className="h-8 w-8 p-0 text-white hover:bg-[#203324]"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Customer</div>
                    <div className="font-medium">{customer?.name || "Unknown"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Driver</div>
                    <div>{driver?.name || "Not assigned"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Address</div>
                    <div>{customer?.address || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div>{customer?.phone || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div>${stop.price || calculatePrice(stop.items || "").toFixed(2)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Items</div>
                    <div>{stop.items || "-"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Notes</div>
                    <div>{stop.notes || "-"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
