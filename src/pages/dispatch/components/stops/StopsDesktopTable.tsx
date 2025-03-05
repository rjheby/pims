
import React from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Edit, Check, X, Hash, GripVertical, Copy } from "lucide-react";
import { Customer } from "@/pages/customers/types";
import { Driver, DeliveryStop, StopFormData } from "./types";
import { calculatePrice } from "./utils";
import { Draggable } from "@hello-pangea/dnd";

interface StopsDesktopTableProps {
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
  draggable?: boolean;
}

export function StopsDesktopTable({
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
  draggable = false
}: StopsDesktopTableProps) {
  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {draggable && !readOnly && <TableHead className="w-10"></TableHead>}
            <TableHead className="w-16">Stop #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Notes</TableHead>
            {!readOnly && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={readOnly ? 8 : 9} className="text-center py-6 text-gray-500">
                No stops added yet.
              </TableCell>
            </TableRow>
          ) : (
            stops.map((stop, index) => {
              const customer = customers.find(c => c.id === stop.customer_id);
              const driver = drivers.find(d => d.id === stop.driver_id);
              
              if (editingIndex === index) {
                return (
                  <TableRow key={`edit-${index}`}>
                    {draggable && !readOnly && <TableCell></TableCell>}
                    <TableCell>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                          <Hash className="h-4 w-4" />
                        </span>
                        <Input 
                          type="number"
                          min="1"
                          className="pl-10"
                          value={editForm.stop_number || ''}
                          onChange={(e) => onEditFormChange({ 
                            ...editForm, 
                            stop_number: e.target.value ? parseInt(e.target.value, 10) : undefined 
                          })}
                          disabled={readOnly}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{customer?.address || '-'}</TableCell>
                    <TableCell>{customer?.phone || '-'}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={editForm.items || ""}
                        onChange={(e) => onEditFormChange({ ...editForm, items: e.target.value })}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>${calculatePrice(editForm.items).toFixed(2)}</TableCell>
                    <TableCell>
                      <Input 
                        value={editForm.notes || ""}
                        onChange={(e) => onEditFormChange({ ...editForm, notes: e.target.value })}
                        disabled={readOnly}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={onEditSave}
                          className="h-8 w-8 p-0 mr-1"
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
                    </TableCell>
                  </TableRow>
                );
              }
              
              const row = (
                <TableRow key={index} className={draggable ? "transition-colors hover:bg-gray-50" : ""}>
                  {draggable && !readOnly && (
                    <TableCell className="w-10">
                      <div className="flex items-center justify-center cursor-grab">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{stop.stop_number || index + 1}</TableCell>
                  <TableCell>{customer?.name || "Unknown"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{customer?.address || "-"}</TableCell>
                  <TableCell>{customer?.phone || "-"}</TableCell>
                  <TableCell>{driver?.name || "Not assigned"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                  <TableCell>${stop.price || calculatePrice(stop.items || "").toFixed(2)}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{stop.notes || "-"}</TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditStart(index)}
                          className="h-8 w-8 p-0 mr-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {onDuplicateStop && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDuplicateStop(index)}
                            className="h-8 w-8 p-0 mr-1"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onRemoveStop(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
              
              if (draggable && !readOnly) {
                return (
                  <Draggable key={`${stop.id}-${index}`} draggableId={`${stop.id}-${index}`} index={index}>
                    {(provided) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <TableCell className="w-10">
                          <div className="flex items-center justify-center cursor-grab">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{stop.stop_number || index + 1}</TableCell>
                        <TableCell>{customer?.name || "Unknown"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{customer?.address || "-"}</TableCell>
                        <TableCell>{customer?.phone || "-"}</TableCell>
                        <TableCell>{driver?.name || "Not assigned"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{stop.items || "-"}</TableCell>
                        <TableCell>${stop.price || calculatePrice(stop.items || "").toFixed(2)}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{stop.notes || "-"}</TableCell>
                        {!readOnly && (
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onEditStart(index)}
                                className="h-8 w-8 p-0 mr-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {onDuplicateStop && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => onDuplicateStop(index)}
                                  className="h-8 w-8 p-0 mr-1"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => onRemoveStop(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </tr>
                    )}
                  </Draggable>
                );
              }
              
              return row;
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
