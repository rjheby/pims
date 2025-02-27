
import React from "react";
import { DispatchCard } from "./DispatchCard";

interface DispatchListProps {
  dispatches: any[];
  onEdit: (dispatchId: string) => void;
  onDuplicate: (dispatch: any) => void;
  onShare: (dispatchId: string, method: 'email' | 'sms') => void;
  onMarkComplete?: (dispatchId: string) => void;
  archived?: boolean;
}

export function DispatchList({ 
  dispatches, 
  onEdit, 
  onDuplicate, 
  onShare, 
  onMarkComplete,
  archived = false 
}: DispatchListProps) {
  if (dispatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {archived ? 
          "No completed dispatches found." : 
          "No scheduled dispatches found. Create your first dispatch to get started."}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dispatches.map((dispatch) => (
        <DispatchCard
          key={dispatch.id}
          dispatch={dispatch}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onShare={onShare}
          onMarkComplete={onMarkComplete}
          archived={archived}
        />
      ))}
    </div>
  );
}
