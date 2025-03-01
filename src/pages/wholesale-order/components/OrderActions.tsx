import { Button } from "@/components/ui/button";
import { Check, Save, SendHorizontal, Upload } from "lucide-react";
import { useState } from "react";
import { OrderItem, safeNumber } from "../types";

interface OrderActionsProps {
  items: OrderItem[];
  onSave?: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  isSubmitDisabled?: boolean;
  allowSendingWithWarnings?: boolean;
}

export function OrderActions({
  items,
  onSave,
  onSubmit,
  isSubmitDisabled = false,
  allowSendingWithWarnings = false,
}: OrderActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  
  // Calculate pallets using safeNumber for all comparisons
  const totalPallets = items.reduce((total, item) => total + safeNumber(item.pallets), 0);
  const hasValidItems = items.some(item => 
    safeNumber(item.pallets) > 0 && item.species && item.length && item.bundleType
  );
  
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!onSubmit) return;
    
    // Check for warnings before submitting
    if (safeNumber(totalPallets) > 24 && !confirmed) {
      setShowWarning(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit();
      setConfirmed(false);
      setShowWarning(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleConfirmWarning = async () => {
    setConfirmed(true);
    setShowWarning(false);
    await handleSubmit();
  };
  
  const getPalletCountClass = () => {
    if (safeNumber(totalPallets) > 24) return "text-red-500";
    if (safeNumber(totalPallets) === 24) return "text-green-500";
    return "text-amber-500";
  };
  
  const getPalletCountMessage = () => {
    if (safeNumber(totalPallets) > 24) {
      return `Exceeds full load by ${safeNumber(totalPallets) - 24} pallets`;
    }
    if (safeNumber(totalPallets) === 24) {
      return "Perfect load! Exactly 24 pallets.";
    }
    return `${24 - safeNumber(totalPallets)} pallets remaining for full load`;
  };
  
  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="rounded-md border p-4 bg-amber-50 text-amber-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.67-.759 1.785-.759 2.455 0l8.25 9.33a1 1 0 00-.216 1.588H2.391a1 1 0 00-.216-1.588L8.485 2.495zM10 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-1 5.75a1.25 1.25 0 112.5 0v.75a.75.75 0 01-1.5 0v-.75z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-700">
                Order Exceeds Maximum Load
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  This order exceeds the maximum load capacity of 24 pallets.
                  Submitting it may result in additional shipping costs or logistical
                  issues.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Button
                    type="button"
                    className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm font-semibold"
                    onClick={handleConfirmWarning}
                  >
                    Continue anyway
                  </Button>
                  <Button
                    type="button"
                    className="ml-3 bg-white hover:bg-gray-50 text-amber-700 px-3 py-2 rounded-md text-sm font-medium"
                    onClick={() => setShowWarning(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end gap-4">
        <Button
          onClick={handleSave}
          className="bg-gray-600 hover:bg-gray-700"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </>
          )}
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          disabled={isSubmitting || isSubmitDisabled || !hasValidItems}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Submit Order
            </>
          )}
        </Button>
      </div>
      <div className="text-sm text-muted-foreground text-right">
        <span className={getPalletCountClass()}>
          {getPalletCountMessage()}
        </span>
      </div>
    </div>
  );
}
