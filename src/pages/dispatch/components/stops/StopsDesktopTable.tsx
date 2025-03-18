
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Pencil, Save, X, Trash, Copy, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Driver, DeliveryStop, StopFormData, Customer, getStatusBadgeVariant } from "./types";
import { formatPrice } from "./utils";

interface StopsDesktopTableProps {
  stops: DeliveryStop[];
  customers: Customer[];
  drivers: Driver[];
  editingIndex: number;
  editForm: StopFormData;
  onEditFormChange: (value: StopFormData) => void;
  onEditStart: (index: number) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onRemoveStop: (index: number) => void;
  readOnly?: boolean;
  selectedStops: string[];
  onSelectStop: (id: string, index: number, event?: React.MouseEvent) => void;
  onDuplicateStop: (index: number) => void;
  draggable?: boolean;
  onOpenCustomerDialog: () => void;
  onOpenItemsDialog: () => void;
}

export const StopsDesktopTable: React.FC<StopsDesktopTableProps> = ({
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
  draggable = true,
  onOpenCustomerDialog,
  onOpenItemsDialog,
}) => {
  function getCustomerName(customerId: string | null): string {
    if (!customerId) return "";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "";
  }

  function getCustomerAddress(customerId: string | null): string {
    if (!customerId) return "";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.address || "";
  }

  function getDriverName(driverId: string | null): string {
    if (!driverId) return "";
    const driver = drivers.find((d) => d.id === driverId);
    return driver?.name || "";
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {!readOnly && (
              <th scope="col" className="w-10 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Select column */}
              </th>
            )}
            <th scope="col" className="w-10 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </th>
            <th scope="col" className="w-48 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="w-60 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th scope="col" className="w-36 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Driver
            </th>
            <th scope="col" className="w-48 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th scope="col" className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            {!readOnly && (
              <th scope="col" className="w-36 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
            {draggable && !readOnly && (
              <th scope="col" className="w-10 px-2 py-3"></th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stops.map((stop, index) => {
            const isEditing = editingIndex === index;
            const isSelected = stop.id ? selectedStops.includes(stop.id.toString()) : false;
            
            return (
              <Draggable
                key={stop.id?.toString() || `new-stop-${index}`}
                draggableId={stop.id?.toString() || `new-stop-${index}`}
                index={index}
                isDragDisabled={!draggable || readOnly || isEditing}
              >
                {(provided) => (
                  <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${isSelected ? "bg-blue-50" : ""} hover:bg-gray-50 ${isEditing ? "bg-blue-50" : ""}`}
                    onClick={(e) => stop.id && onSelectStop(stop.id.toString(), index, e)}
                  >
                    {!readOnly && (
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                        {stop.id && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => stop.id && onSelectStop(stop.id.toString(), index)}
                            className="h-4 w-4"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
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
                          className="h-9 w-20 text-center mx-auto"
                          min="1"
                        />
                      ) : (
                        stop.stop_number || index + 1
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      {isEditing ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 truncate" 
                          onClick={onOpenCustomerDialog}
                        >
                          {getCustomerName(editForm.customer_id) || "Select Customer"}
                        </Button>
                      ) : (
                        <div className="truncate">
                          {stop.customer_name || getCustomerName(stop.customer_id)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="truncate max-w-xs">
                        {stop.customer_address || getCustomerAddress(stop.customer_id)}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      {isEditing ? (
                        <Select
                          value={editForm.driver_id || "unassigned-driver"}
                          onValueChange={(value) =>
                            onEditFormChange({
                              ...editForm,
                              driver_id: value === "unassigned-driver" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select Driver" />
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
                      ) : (
                        <div className="truncate">
                          {stop.driver_name || getDriverName(stop.driver_id) || "Unassigned"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                      {isEditing ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-9 truncate"
                          onClick={onOpenItemsDialog}
                        >
                          {editForm.items || "Select Items"}
                        </Button>
                      ) : (
                        <div className="truncate max-w-xs">
                          {stop.items || "No items"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                      {formatPrice(stop.price)}
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right space-x-1 text-center">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onEditSave}
                              className="h-8 w-8 p-0 text-green-600"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onEditCancel}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditStart(index);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveStop(index);
                              }}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    )}
                    {draggable && !readOnly && (
                      <td className="pl-2 pr-4 py-2">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                      </td>
                    )}
                  </tr>
                )}
              </Draggable>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
