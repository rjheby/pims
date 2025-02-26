
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Archive } from "lucide-react";

interface BaseOrderActionsProps {
  onSave: () => void;
  archiveLink: string;
  customActions?: React.ReactNode;
}

export function BaseOrderActions({ onSave, archiveLink, customActions }: BaseOrderActionsProps) {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-end gap-4">
        <Button onClick={onSave} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
          Save Order
        </Button>
        {customActions}
      </div>
      
      <div className="flex justify-center pt-6 border-t">
        <Button
          asChild
          className="bg-[#f1e8c7] text-[#222222] hover:bg-[#f1e8c7]/90"
        >
          <Link to={archiveLink} className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            <span>View All Orders</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
