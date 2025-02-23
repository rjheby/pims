
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
            className="border-[#2A4131] text-[#2A4131] hover:bg-[#F2E9D2]"
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button 
            variant="default"
            onClick={onSave}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button 
            variant="outline"
            onClick={onDiscard}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            <X className="mr-2 h-4 w-4" />
            Discard
          </Button>
        </>
      )}
      <Button 
        variant="outline" 
        onClick={onToggleAdmin}
        className={cn(
          "transition-all duration-300",
          isAdmin 
            ? "border-red-700 bg-red-600 text-white hover:bg-red-700"
            : "border-red-600 text-red-600 hover:bg-red-50"
        )}
      >
        {isAdmin ? "Exit Admin Mode" : "Admin Mode"}
      </Button>
    </div>
  );
}
