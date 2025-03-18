
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Save, 
  X, 
  Trash, 
  ChevronsUpDown, 
  Pencil, 
  Copy,
  Phone,
  MapPin
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Customer, DeliveryStop, Driver, StopFormData, DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant, DeliveryStatus } from "./types";

interface StopsMobileCardsProps {
  stops: DeliveryStop[];
  customers: Customer[];
  drivers: Driver[];
  editingIndex: number;
  editForm: StopFormData;
  onEditFormChange: (form: StopFormData) => void;
  onEditStart: (index: number) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onRemoveStop: (index: number) => void;
  readOnly?: boolean;
  selectedStops: string[];
  onSelectStop: (stopId: string, index: number, event?: React.MouseEvent) => void;
  onDuplicateStop: (index: number) => void;
  onOpenCustomerDialog: () => void;
  onOpenItemsDialog: () => void;
}

const StopsMobileCards: React.FC<StopsMobileCardsProps> = ({
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
  selectedStops,
  onSelectStop,
  onDuplicateStop,
  onOpenCustomerDialog,
  onOpenItemsDialog
}) => {
  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "Unassigned";
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : "Unknown";
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return "Unassigned";
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : "Unknown";
  };

  const handlePhoneCall = (phone: string | undefined) => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleOpenMap = (address: string | undefined) => {
    if (!address) return;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
  };

  if (stops.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No stops added yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stops.map((stop, index) => {
        const isEditing = editingIndex === index;
        const isSelected = stop.id ? selectedStops.includes(stop.id.toString()) : false;
        
        return (
          <Draggable
            key={stop.id || `new-stop-${index}`}
            draggableId={stop.id?.toString() || `new-stop-${index}`}
            index={index}
            isDragDisabled={readOnly || isEditing}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
              >
                <Card className={isSelected ? "border-primary" : ""}>
                  <CardHeader className="pb-2 pt-3 px-3 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editForm.stop_number || index + 1}
                          onChange={(e) => 
                            onEditFormChange({
                              ...editForm,
                              stop_number: parseInt(e.target.value) || index + 1,
                            })
                          }
                          className="h-8 w-16 text-center"
                          min="1"
                        />
                      ) : (
                        <span className="text-sm font-medium mr-2 bg-slate-100 px-2 py-1 rounded-md">
                          Stop #{stop.stop_number || index + 1}
                        </span>
                      )}
                      <div {...provided.dragHandleProps} className="cursor-grab">
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(stop.status || "pending")} className="ml-auto">
                      {stop.status || "pending"}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="px-3 py-2 space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Customer</label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={onOpenCustomerDialog}
                          >
                            {getCustomerName(editForm.customer_id) || "Select Customer"}
                          </Button>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Driver</label>
                          <Select
                            value={editForm.driver_id || "unassigned-driver"}
                            onValueChange={(value) => 
                              onEditFormChange({ ...editForm, driver_id: value === "unassigned-driver" ? null : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned-driver">Unassigned</SelectItem>
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
                            className="w-full justify-start text-left font-normal"
                            onClick={onOpenItemsDialog}
                          >
                            {editForm.items ? `${editForm.items.split(',').length} items selected` : "Select Items"}
                          </Button>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Notes</label>
                          <Textarea
                            value={editForm.notes || ""}
                            onChange={(e) => 
                              onEditFormChange({ ...editForm, notes: e.target.value })
                            }
                            className="w-full min-h-[60px]"
                            placeholder="Add notes..."
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-1 block">Status</label>
                          <Select
                            value={stop.status || "pending"}
                            onValueChange={(value) => {
                              const newStop = {...stop, status: value};
                              stop.status = value;
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {DELIVERY_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Customer:</div>
                            <div>{getCustomerName(stop.customer_id)}</div>
                            
                            {stop.customer_phone && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 p-0 text-muted-foreground flex items-center"
                                onClick={() => handlePhoneCall(stop.customer_phone)}
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                <span className="text-xs">{stop.customer_phone}</span>
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Driver:</div>
                            <div>{getDriverName(stop.driver_id)}</div>
                          </div>
                        </div>
                        
                        {stop.customer_address && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Address:</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 w-full text-left flex items-start"
                              onClick={() => handleOpenMap(stop.customer_address)}
                            >
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="text-xs">{stop.customer_address}</span>
                            </Button>
                          </div>
                        )}
                        
                        {stop.items && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Items:</div>
                            <div className="text-sm break-words">{stop.items}</div>
                          </div>
                        )}
                        
                        {stop.notes && (
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Notes:</div>
                            <div className="text-sm break-words">{stop.notes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="px-3 py-2 flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={onEditCancel}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button variant="default" size="sm" onClick={onEditSave}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </>
                    ) : !readOnly ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-1" />
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditStart(index)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicateStop(index)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRemoveStop(index)}>
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="outline" size="sm" disabled={true}>
                        <Pencil className="h-4 w-4 mr-1" />
                        View Only
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}
          </Draggable>
        );
      })}
    </div>
  );
};

export { StopsMobileCards };
