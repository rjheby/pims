
import React, { useState, useEffect } from "react";
import { useStopsData } from "./useStopsData";
import { AddStopForm } from "./AddStopForm";
import { StopsDesktopTable } from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { StopsTableProps, DeliveryStop } from "./types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Users, UserPlus, Copy, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export function StopsTable({ 
  stops = [], 
  onStopsChange, 
  masterScheduleId,
  readOnly = false,
  useMobileLayout = false
}: StopsTableProps) {
  const { toast } = useToast();
  const {
    customers,
    drivers,
    loading,
    currentStop,
    setCurrentStop,
    editingIndex,
    editForm,
    setEditForm,
    handleAddStop,
    handleRemoveStop,
    handleEditStart,
    handleEditSave,
    handleEditCancel,
    handleDriverAssign
  } = useStopsData(stops, onStopsChange, masterScheduleId);

  // Group stops by driver
  const [expandedDrivers, setExpandedDrivers] = useState<Record<string, boolean>>({});
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Sort stops by driver and stop number
  const sortedStops = [...stops].sort((a, b) => {
    // First sort by driver
    const driverA = a.driver_id || "unassigned";
    const driverB = b.driver_id || "unassigned";
    
    if (driverA !== driverB) {
      return driverA.localeCompare(driverB);
    }
    
    // Then sort by stop number
    const stopNumA = a.stop_number || 999;
    const stopNumB = b.stop_number || 999;
    return stopNumA - stopNumB;
  });

  // Create driver groups
  const stopsByDriver: Record<string, DeliveryStop[]> = {};
  sortedStops.forEach(stop => {
    const driverId = stop.driver_id || "unassigned";
    if (!stopsByDriver[driverId]) {
      stopsByDriver[driverId] = [];
    }
    stopsByDriver[driverId].push(stop);
  });

  // Initialize expanded state for all drivers
  useEffect(() => {
    const drivers: Record<string, boolean> = {};
    Object.keys(stopsByDriver).forEach(driverId => {
      // If it's a new driver, expand by default
      if (expandedDrivers[driverId] === undefined) {
        drivers[driverId] = true;
      } else {
        drivers[driverId] = expandedDrivers[driverId];
      }
    });
    setExpandedDrivers(drivers);
  }, [stopsByDriver]);

  // Handle drag end event
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // If dropped outside of a droppable area
    if (!destination) return;
    
    // Parse the droppable IDs to get driver IDs
    const sourceDriverId = source.droppableId;
    const destDriverId = destination.droppableId;
    
    // Create a copy of the stops array
    const newStops = [...stops];
    
    // Find the stop being dragged
    const sourceStops = stopsByDriver[sourceDriverId];
    const [draggedStop] = sourceStops.splice(source.index, 1);
    
    // If moving to a different driver, update the driver_id
    if (sourceDriverId !== destDriverId) {
      draggedStop.driver_id = destDriverId === "unassigned" ? null : destDriverId;
      toast({
        title: "Driver Reassigned",
        description: `Stop #${draggedStop.stop_number} reassigned to ${destDriverId === "unassigned" ? "Unassigned" : drivers.find(d => d.id === destDriverId)?.name || "New Driver"}`,
      });
    }
    
    // Add the stop to the destination driver's list
    const destStops = stopsByDriver[destDriverId] || [];
    destStops.splice(destination.index, 0, draggedStop);
    
    // Recalculate stop numbers for all stops
    Object.values(stopsByDriver).forEach(driverStops => {
      driverStops.forEach((stop, index) => {
        stop.stop_number = index + 1;
      });
    });
    
    // Update all stops
    const updatedStops = Object.values(stopsByDriver).flat();
    
    // Call onStopsChange with the updated stops array
    if (onStopsChange) {
      onStopsChange(updatedStops);
    }
  };

  const toggleDriverExpand = (driverId: string) => {
    setExpandedDrivers(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  const handleDriverChange = (stopId: string | number | undefined, newDriverId: string) => {
    if (!stopId) return;
    
    handleDriverAssign(stopId, newDriverId);
  };

  const handleStopSelection = (stopId: string, index: number, event?: React.MouseEvent) => {
    // Handle shift key selection
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Get all stops as a flat array
      const flatStops = sortedStops.map(stop => stop.id?.toString() || "");
      const start = Math.min(index, lastSelectedIndex);
      const end = Math.max(index, lastSelectedIndex);
      const stopsInRange = flatStops.slice(start, end + 1).filter(id => id);
      
      setSelectedStops(prev => {
        const selection = new Set(prev);
        stopsInRange.forEach(id => selection.add(id));
        return Array.from(selection);
      });
    } else {
      // Normal selection
      setSelectedStops(prev => {
        const exists = prev.includes(stopId);
        return exists 
          ? prev.filter(id => id !== stopId) 
          : [...prev, stopId];
      });
      setLastSelectedIndex(index);
    }
  };

  const handleSelectAllForDriver = (driverId: string) => {
    const driverStops = stopsByDriver[driverId] || [];
    const driverStopIds = driverStops.map(stop => stop.id?.toString() || "").filter(id => id);
    
    // Check if all stops for this driver are already selected
    const allSelected = driverStopIds.every(id => selectedStops.includes(id));
    
    if (allSelected) {
      // Deselect all stops for this driver
      setSelectedStops(prev => prev.filter(id => !driverStopIds.includes(id)));
    } else {
      // Select all stops for this driver
      setSelectedStops(prev => {
        const selection = new Set(prev);
        driverStopIds.forEach(id => selection.add(id));
        return Array.from(selection);
      });
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedStops.length === 0) return;
    
    // Find the selected stops
    const stopsToDuplicate = stops.filter(stop => 
      stop.id && selectedStops.includes(stop.id.toString())
    );
    
    if (stopsToDuplicate.length === 0) return;
    
    // Create duplicates (without IDs)
    const duplicates = stopsToDuplicate.map(stop => ({
      ...stop,
      id: undefined,  // Remove ID so a new one will be generated
    }));
    
    // Add the duplicates to the stops
    if (onStopsChange) {
      const updatedStops = [...stops, ...duplicates];
      onStopsChange(updatedStops);
      
      toast({
        title: "Stops Duplicated",
        description: `${duplicates.length} stop${duplicates.length > 1 ? 's' : ''} duplicated successfully.`,
      });
    }
    
    // Clear selection
    setSelectedStops([]);
  };

  const handleDeleteSelected = () => {
    if (selectedStops.length === 0) return;
    
    // Filter out the selected stops
    const updatedStops = stops.filter(stop => 
      !stop.id || !selectedStops.includes(stop.id.toString())
    );
    
    if (onStopsChange) {
      onStopsChange(updatedStops);
      
      toast({
        title: "Stops Deleted",
        description: `${selectedStops.length} stop${selectedStops.length > 1 ? 's' : ''} deleted.`,
      });
    }
    
    // Clear selection
    setSelectedStops([]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Delivery Stops</h3>
      
      <AddStopForm
        customers={customers}
        drivers={drivers}
        currentStop={currentStop}
        onStopChange={setCurrentStop}
        onAddStop={handleAddStop}
        readOnly={readOnly}
      />
      
      {selectedStops.length > 0 && !readOnly && (
        <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
          <span className="text-sm font-medium">{selectedStops.length} selected</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDuplicateSelected}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
      
      {!useMobileLayout && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {Object.entries(stopsByDriver).map(([driverId, driverStops]) => {
              const driver = drivers.find(d => d.id === driverId);
              const driverName = driverId === "unassigned" 
                ? "Unassigned" 
                : (driver?.name || "Unknown Driver");
              
              return (
                <div key={driverId} className="border rounded-lg overflow-hidden">
                  <div className="bg-[#2A4131] text-white p-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id={`select-all-driver-${driverId}`}
                        checked={driverStops.every(stop => 
                          stop.id && selectedStops.includes(stop.id.toString())
                        )}
                        onCheckedChange={() => handleSelectAllForDriver(driverId)}
                        className="h-4 w-4 rounded-sm border-white"
                      />
                      <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleDriverExpand(driverId)}
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">{driverName}</span>
                        <span className="bg-white text-[#2A4131] rounded-full px-2 py-0.5 text-sm">
                          {driverStops.length} stops
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {!readOnly && (
                        <Select 
                          value={selectedDriver} 
                          onValueChange={(value) => setSelectedDriver(value)}
                          onOpenChange={(open) => {
                            if (!open && selectedDriver && driverId !== selectedDriver) {
                              // Apply the selected driver to all stops in this group
                              driverStops.forEach(stop => {
                                handleDriverChange(stop.id, selectedDriver);
                              });
                              setSelectedDriver("");
                              toast({
                                title: "Driver Reassigned",
                                description: `All stops reassigned to ${drivers.find(d => d.id === selectedDriver)?.name || "New Driver"}`,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 w-auto bg-white text-[#2A4131] mr-2">
                            <div className="flex items-center">
                              <UserPlus className="h-4 w-4 mr-1" />
                              <span>Reassign All</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <div 
                        className="cursor-pointer"
                        onClick={() => toggleDriverExpand(driverId)}
                      >
                        {expandedDrivers[driverId] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedDrivers[driverId] && (
                    <Droppable droppableId={driverId}>
                      {(provided) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="bg-white"
                        >
                          <StopsDesktopTable
                            stops={driverStops}
                            customers={customers}
                            drivers={drivers}
                            editingIndex={editingIndex}
                            editForm={editForm}
                            onEditFormChange={setEditForm}
                            onEditStart={handleEditStart}
                            onEditSave={handleEditSave}
                            onEditCancel={handleEditCancel}
                            onRemoveStop={handleRemoveStop}
                            readOnly={readOnly}
                            draggable={true}
                            selectedStops={selectedStops}
                            onSelectStop={handleStopSelection}
                          />
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  )}
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}
      
      {useMobileLayout && (
        <StopsMobileCards
          stops={sortedStops}
          customers={customers}
          drivers={drivers}
          editingIndex={editingIndex}
          editForm={editForm}
          onEditFormChange={setEditForm}
          onEditStart={handleEditStart}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onRemoveStop={handleRemoveStop}
          readOnly={readOnly}
          selectedStops={selectedStops}
          onSelectStop={handleStopSelection}
        />
      )}
    </div>
  );
}
