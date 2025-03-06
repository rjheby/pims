
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Customer, DeliveryStop, Driver, StopFormData, DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant } from "./types";

interface StopsDesktopTableProps {
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
  draggable?: boolean;
  onOpenCustomerDialog: () => void;
  onOpenItemsDialog: () => void;
}

const StopsDesktopTable: React.FC<StopsDesktopTableProps> = ({
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

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {draggable && <TableHead style={{ width: "40px" }}>&nbsp;</TableHead>}
              <TableHead style={{ width: "60px" }}>#</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead style={{ width: "120px" }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={draggable ? 9 : 8} className="text-center h-24 text-muted-foreground">
                  No stops added yet
                </TableCell>
              </TableRow>
            ) : (
              stops.map((stop, index) => {
                const isEditing = editingIndex === index;
                const isSelected = stop.id ? selectedStops.includes(stop.id.toString()) : false;
                
                return (
                  <Draggable
                    key={stop.id || `new-stop-${index}`}
                    draggableId={stop.id?.toString() || `new-stop-${index}`}
                    index={index}
                    isDragDisabled={readOnly || isEditing || !draggable}
                  >
                    {(provided) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={isSelected ? "bg-muted/50" : undefined}
                      >
                        {draggable && (
                          <TableCell className="py-2">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <ChevronsUpDown className="h-4 w-4 text-muted-foreground mx-auto" />
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell className="py-2 font-medium">
                          {stop.stop_number || index + 1}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              onClick={onOpenCustomerDialog}
                            >
                              {getCustomerName(editForm.customer_id) || "Select Customer"}
                            </Button>
                          ) : (
                            <div className="flex flex-col">
                              <span>{getCustomerName(stop.customer_id)}</span>
                              {stop.customer_phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 p-0 w-auto justify-start text-muted-foreground"
                                  onClick={() => handlePhoneCall(stop.customer_phone)}
                                >
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{stop.customer_phone}</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          {stop.customer_address ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 w-auto text-left font-normal flex items-start"
                              onClick={() => handleOpenMap(stop.customer_address)}
                            >
                              <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span className="text-xs line-clamp-2">{stop.customer_address}</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">No address</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Select
                              value={editForm.driver_id || ""}
                              onValueChange={(value) => 
                                onEditFormChange({ ...editForm, driver_id: value || null })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select driver" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span>{getDriverName(stop.driver_id)}</span>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              onClick={onOpenItemsDialog}
                            >
                              {editForm.items ? truncateText(editForm.items, 20) : "Select Items"}
                            </Button>
                          ) : (
                            <span className="line-clamp-2 text-sm">
                              {truncateText(stop.items || "", 30)}
                            </span>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          {isEditing ? (
                            <Textarea
                              value={editForm.notes || ""}
                              onChange={(e) => 
                                onEditFormChange({ ...editForm, notes: e.target.value })
                              }
                              className="w-full min-h-[60px]"
                              placeholder="Add notes..."
                            />
                          ) : (
                            <span className="line-clamp-2 text-sm">
                              {truncateText(stop.notes || "", 30)}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="py-2">
                          {isEditing ? (
                            <Select
                              value={stop.status || "pending"}
                              onValueChange={(value) => 
                                stop.status = value
                              }
                            >
                              <SelectTrigger className="w-[130px]">
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
                          ) : (
                            <Badge variant={getStatusBadgeVariant(stop.status || "pending")}>
                              {stop.status || "pending"}
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 justify-end">
                            {isEditing ? (
                              <>
                                <Button variant="outline" size="sm" onClick={onEditSave}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={onEditCancel}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : !readOnly ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onDuplicateStop(index)}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export { StopsDesktopTable };
