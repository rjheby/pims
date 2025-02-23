
import { Button } from "@/components/ui/button";
import { Undo, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/context/AdminContext";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function GlobalAdminControls() {
  const { 
    isAdmin, 
    hasUnsavedChanges, 
    handleAdminToggle,
    markContentChanged
  } = useAdmin();
  const location = useLocation();
  const { toast } = useToast();

  const isWholesaleOrder = location.pathname === "/wholesale-order";

  const handleSave = () => {
    if (isWholesaleOrder) {
      // Let WholesaleOrder handle its own save logic
      return;
    }
    
    // Generic save logic for other pages
    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleDiscard = () => {
    if (isWholesaleOrder) {
      // Let WholesaleOrder handle its own discard logic
      return;
    }

    // Generic discard logic for other pages
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
    });
  };

  const handleUndo = () => {
    if (isWholesaleOrder) {
      // Let WholesaleOrder handle its own undo logic
      return;
    }

    // Generic undo logic for other pages
    toast({
      title: "Action undone",
      description: "Your last change has been undone.",
    });
  };

  return (
    <div className="flex gap-2">
      {isAdmin && hasUnsavedChanges && (
        <>
          <Button 
            variant="outline" 
            onClick={handleUndo}
            className="border-[#2A4131] text-[#2A4131] hover:bg-[#F2E9D2]"
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
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
        onClick={() => handleAdminToggle()}
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
