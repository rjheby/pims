
import { Button } from "@/components/ui/button";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";

export function OrderActions() {
  const { 
    hasUnsavedChanges, 
    saveChanges, 
    discardChanges, 
    undoLastChange,
    isAdmin
  } = useWholesaleOrder();

  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-end gap-4">
      {hasUnsavedChanges && (
        <>
          <Button
            variant="outline"
            onClick={discardChanges}
          >
            Discard Changes
          </Button>
          <Button
            variant="outline"
            onClick={undoLastChange}
          >
            Undo Last Change
          </Button>
          <Button
            onClick={saveChanges}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            Save Changes
          </Button>
        </>
      )}
    </div>
  );
}
