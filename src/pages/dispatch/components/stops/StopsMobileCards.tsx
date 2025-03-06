
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
import { Trash, Edit, Check, X, GripVertical, Copy, Search, Package } from "lucide-react";
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
  onOpenCustomerDialog?: () => void;
  onOpenItemsDialog?: () => void;
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
  onDuplicateStop,
  onOpenCustomerDialog,
  onOpenItemsDialog
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
              } shadow-sm hover:shadow transition-shadow`}
              onClick={(e) => 
                onSelectStop && 
                onSelectStop(stop.id?.toString() || index.toString(), index, e)
              }
            >
              <CardContent className="p-4">
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Edit Stop #{editForm.stop_number || index + 1}</div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={onEditSave}
                          className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-700"
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
                    
                    <div className="space-y-3">
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
                        <Button 
                          variant="outline" 
                          className="w-full justify-between text-left font-normal"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCustomerDialog && onOpenCustomerDialog();
                          }}
                        >
                          <span className="truncate">
                            {customers.find(c => c.id === editForm.customer_id)?.name || 'Select customer'}
                          </span>
                          <Search className="h-4 w-4 opacity-50 flex-shrink-0" />
                        </Button>
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
                        <Button 
                          variant="outline" 
                          className="w-full justify-between text-left font-normal"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenItemsDialog && onOpenItemsDialog();
                          }}
                        >
                          <span className="truncate">
                            {editForm.items || 'Select items'}
                          </span>
                          <Package className="h-4 w-4 opacity-50 flex-shrink-0" />
                        </Button>
                        {editForm.items && (
                          <p className="text-sm text-gray-500 mt-1">
                            Price: ${calculatePrice(editForm.items).toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Notes</label>
                        <Input 
                          value={editForm.notes || ""}
                          onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                          disabled={readOnly}
                          placeholder="Add notes..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-500">Stop #{stop.stop_number || index + 1}</div>
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
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
                              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
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
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2 text-sm">
                      {customer?.address && (
                        <div className="text-gray-700 flex">
                          <span className="font-medium w-20">Address:</span> 
                          <span className="flex-1">{customer.address}</span>
                        </div>
                      )}
                      {customer?.phone && (
                        <div className="text-gray-700 flex">
                          <span className="font-medium w-20">Phone:</span> 
                          <span className="flex-1">{customer.phone}</span>
                        </div>
                      )}
                      <div className="text-gray-700 flex">
                        <span className="font-medium w-20">Driver:</span> 
                        <span className="flex-1">{driver?.name || "Not assigned"}</span>
                      </div>
                      {stop.items && (
                        <div className="text-gray-700 flex">
                          <span className="font-medium w-20">Items:</span> 
                          <span className="flex-1">{stop.items}</span>
                        </div>
                      )}
                      <div className="text-gray-700 flex">
                        <span className="font-medium w-20">Price:</span> 
                        <span className="flex-1">${stop.price || calculatePrice(stop.items || "")}</span>
                      </div>
                      {stop.notes && (
                        <div className="text-gray-700 flex">
                          <span className="font-medium w-20">Notes:</span> 
                          <span className="flex-1">{stop.notes}</span>
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
