
import React from "react";
import { useStopsData } from "./useStopsData";
import { AddStopForm } from "./AddStopForm";
import { StopsDesktopTable } from "./StopsDesktopTable";
import { StopsMobileCards } from "./StopsMobileCards";
import { StopsTableProps } from "./types";

export function StopsTable({ 
  stops = [], 
  onStopsChange, 
  masterScheduleId,
  readOnly = false,
  useMobileLayout = false
}: StopsTableProps) {
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
    handleEditCancel
  } = useStopsData(stops, onStopsChange, masterScheduleId);

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
      
      {useMobileLayout ? (
        <StopsMobileCards
          stops={stops}
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
        />
      ) : (
        <StopsDesktopTable
          stops={stops}
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
        />
      )}
    </div>
  );
}
