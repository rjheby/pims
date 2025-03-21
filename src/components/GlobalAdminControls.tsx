
import { Button } from "@/components/ui/button";
import { Undo, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function GlobalAdminControls() {
  // We'll add a try-catch block to handle the case where AdminProvider isn't available
  try {
    const { 
      isAdmin, 
      hasUnsavedChanges, 
      handleAdminToggle,
      setHasUnsavedChanges
    } = useAdmin();
    const location = useLocation();
    const { toast } = useToast();

    const handleSave = () => {
      toast({
        title: "Changes saved",
        description: "Your changes have been saved successfully.",
      });
      setHasUnsavedChanges(false);
    };

    const handleDiscard = () => {
      toast({
        title: "Changes discarded",
        description: "Your changes have been discarded.",
      });
      setHasUnsavedChanges(false);
    };

    return (
      <div className="flex gap-2">
        {isAdmin && hasUnsavedChanges && (
          <>
            <Button 
              variant="default"
              onClick={handleSave}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
            <Button 
              variant="outline"
              onClick={handleDiscard}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <X className="mr-2 h-4 w-4" />
              Discard
            </Button>
          </>
        )}
        <Button 
          variant="outline" 
          onClick={() => handleAdminToggle({
            onSave: handleSave,
            onDiscard: handleDiscard,
          })}
          className={cn(
            "transition-all duration-300 px-4 w-auto",
            isAdmin 
              ? "border-red-700 bg-red-600 text-white hover:bg-red-700"
              : "border-red-600 text-red-600 hover:bg-red-50"
          )}
        >
          {isAdmin ? "Exit" : "Edit"}
        </Button>
      </div>
    );
  } catch (error) {
    // If AdminContext isn't available, return null or a fallback UI
    console.warn("AdminContext not available for GlobalAdminControls");
    return null;
  }
}
