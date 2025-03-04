
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Archive, Save, SendHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface BaseOrderActionsProps {
  onSave: () => void;
  onSubmit: () => void;  
  archiveLink: string;
  customActions?: React.ReactNode;
  isSaving?: boolean;     
  isSubmitting?: boolean;
  submitLabel?: string; // Added submit label prop
}

export function BaseOrderActions({ 
  onSave, 
  onSubmit, 
  archiveLink, 
  customActions,
  isSaving = false,
  isSubmitting = false,
  submitLabel = "Submit Order" // Default label
}: BaseOrderActionsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col space-y-4">
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-4`}>
        <Button 
          onClick={onSave} 
          className="bg-gray-600 hover:bg-gray-700 w-full md:w-auto"
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
          onClick={onSubmit} 
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <SendHorizontal className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
        
        {customActions}
      </div>
      
      <div className="flex justify-center pt-6 border-t">
        <Button
          asChild
          className="bg-[#f1e8c7] text-[#222222] hover:bg-[#f1e8c7]/90 w-full md:w-auto"
        >
          <Link to={archiveLink} className="flex items-center gap-2 justify-center">
            <Archive className="h-5 w-5" />
            <span>View All Orders</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
