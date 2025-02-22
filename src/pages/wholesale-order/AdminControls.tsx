
import { Button } from "@/components/ui/button";
import { Undo, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminControlsProps {
  isAdmin: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onUndo: () => void;
  onToggleAdmin: () => void;
  canUndo: boolean;
}

export function AdminControls({
  isAdmin,
  hasUnsavedChanges,
  onSave,
  onDiscard,
  onUndo,
  onToggleAdmin,
  canUndo,
}: AdminControlsProps) {
  return (
    <div className="flex gap-2">
      {isAdmin && hasUnsavedChanges && (
        <>
          <Button 
            variant="outline" 
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button 
            variant="default"
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button 
            variant="outline"
            onClick={onDiscard}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-2 h-4 w-4" />
            Discard
          </Button>
        </>
      )}
      <Button 
        variant="ghost" 
        onClick={onToggleAdmin}
        className={cn(
          "transition-all duration-1000",
          isAdmin && "bg-red-50 text-red-600 border-red-200 border"
        )}
      >
        {isAdmin ? "Exit Admin Mode" : "Admin Mode"}
      </Button>
    </div>
  );
}
