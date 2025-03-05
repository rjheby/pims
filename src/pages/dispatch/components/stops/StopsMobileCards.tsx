
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Check, X, GripVertical, Copy } from "lucide-react";
import { Customer } from "@/pages/customers/types";
import { Driver, DeliveryStop, StopFormData } from "./types";
import { calculatePrice } from "./utils";

interface StopsMobileCardsProps {
  stops: DeliveryStop[];
  customers: Customer[];
  drivers: Driver[];
  editingIndex: number;
  editForm: StopFormData;
  onEditFormChange: React.Dispatch<React.SetStateAction<StopFormData>>;
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
  return (
    <div className="space-y-4">
      {stops.length === 0 ? (
        <p className="text-center py-6 text-gray-500">No stops added yet.</p>
      ) : (
        stops.map((stop, index) => {
          const customer = customers.find(c => c.id === stop.customer_id);
          const driver = drivers.find(d => d.id === stop.driver_id);
          
          const isEditing = editingIndex === index;
          
          return (
            <Card
              key={`${stop.id || index}-card`}
              className={`border ${
                selectedStops.includes(stop.id?.toString() || index.toString())
                  ? "border-primary"
                  : ""
              }`}
              onClick={(e) => 
                onSelectStop && 
                onSelectStop(stop.id?.toString() || index.toString(), index, e)
              }
            >
              <CardContent className="p-4">
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Edit Stop #{editForm.stop_number || index + 1}</div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={onEditSave}
                          className="h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={onEditCancel}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Stop #</label>
                        <Input 
                          type="number"
                          min="1"
                          value={editForm.stop_number || ''}
                          onChange={(e) => onEditFormChange({ 
                            ...editForm, 
                            stop_number: e.target.value ? parseInt(e.target.value, 10) : undefined 
                          })}
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Customer</label>
                        <Select 
                          value={editForm.customer_id || ""} 
                          onValueChange={(value) => onEditFormChange({ ...editForm, customer_id: value })}
                          disabled={readOnly}
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
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Driver</label>
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
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Items</label>
                        <Input 
                          value={editForm.items || ""}
                          onChange={(e) => onEditFormChange({ ...editForm, items: e.target.value })}
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Notes</label>
                        <Input 
                          value={editForm.notes || ""}
                          onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                          disabled={readOnly}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Stop #{stop.stop_number || index + 1}</div>
                        <div className="text-lg font-semibold">{customer?.name || "Unknown Customer"}</div>
                      </div>
                      
                      {!readOnly && (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditStart(index);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {onDuplicateStop && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateStop(index);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveStop(index);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-1 text-sm">
                      {customer?.address && (
                        <div className="text-gray-700">
                          <span className="font-medium">Address:</span> {customer.address}
                        </div>
                      )}
                      {customer?.phone && (
                        <div className="text-gray-700">
                          <span className="font-medium">Phone:</span> {customer.phone}
                        </div>
                      )}
                      <div className="text-gray-700">
                        <span className="font-medium">Driver:</span> {driver?.name || "Not assigned"}
                      </div>
                      {stop.items && (
                        <div className="text-gray-700">
                          <span className="font-medium">Items:</span> {stop.items}
                        </div>
                      )}
                      <div className="text-gray-700">
                        <span className="font-medium">Price:</span> ${stop.price || calculatePrice(stop.items || "")}
                      </div>
                      {stop.notes && (
                        <div className="text-gray-700">
                          <span className="font-medium">Notes:</span> {stop.notes}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
