
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface BaseOrderActionsProps {
  onSave?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  saveLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  savingLabel?: string;
  submittingLabel?: string;
  isSaving?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  showCancelButton?: boolean;
  showDeleteButton?: boolean;
  showArchiveButton?: boolean;
  archiveLink?: string;
  disabled?: boolean;
  mobileLayout?: boolean;
}

export function BaseOrderActions({
  onSave,
  onSubmit,
  onCancel,
  onDelete,
  saveLabel = "Save as Draft",
  submitLabel = "Submit Order",
  cancelLabel = "Cancel",
  deleteLabel = "Delete",
  savingLabel = "Saving...",
  submittingLabel = "Submitting...",
  isSaving = false,
  isSubmitting = false,
  isDeleting = false,
  showCancelButton = true,
  showDeleteButton = false,
  showArchiveButton = false,
  archiveLink = "/",
  disabled = false,
  mobileLayout = false
}: BaseOrderActionsProps) {
  return (
    <div className={`flex ${mobileLayout ? "flex-col gap-2" : "flex-row gap-4"} justify-between items-center`}>
      <div className={`flex ${mobileLayout ? "w-full flex-col" : "flex-row"} gap-2`}>
        {onCancel && showCancelButton && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={disabled || isSaving || isSubmitting || isDeleting}
            className={mobileLayout ? "w-full" : ""}
          >
            {cancelLabel}
          </Button>
        )}
        
        {onDelete && showDeleteButton && (
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={disabled || isSaving || isSubmitting || isDeleting}
            className={mobileLayout ? "w-full" : ""}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              deleteLabel
            )}
          </Button>
        )}
      </div>
      
      <div className={`flex ${mobileLayout ? "w-full flex-col-reverse" : "flex-row"} gap-2`}>
        {showArchiveButton && (
          <Button
            variant="outline"
            asChild
            disabled={disabled || isSaving || isSubmitting || isDeleting}
            className={mobileLayout ? "w-full" : ""}
          >
            <Link to={archiveLink}>View Archive</Link>
          </Button>
        )}
        
        {onSave && (
          <Button
            variant="outline"
            onClick={onSave}
            disabled={disabled || isSaving || isSubmitting || isDeleting}
            className={mobileLayout ? "w-full" : ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {savingLabel}
              </>
            ) : (
              saveLabel
            )}
          </Button>
        )}
        
        {onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={disabled || isSaving || isSubmitting || isDeleting}
            className={mobileLayout ? "w-full" : ""}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {submittingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
