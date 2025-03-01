
import { Button } from "@/components/ui/button";
import { Save, FileText, FileUp } from "lucide-react";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";
import { LoadTemplateDialog } from "./LoadTemplateDialog";
import { TemplateManagementDialog } from "./TemplateManagementDialog";
import { OrderItem } from "../types";
import { Link } from "react-router-dom";

interface OrderFormTemplateControlsProps {
  items: OrderItem[];
  onTemplateSelected: (items: OrderItem[]) => void;
}

export function OrderFormTemplateControls({ 
  items, 
  onTemplateSelected 
}: OrderFormTemplateControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <SaveAsTemplateDialog 
        items={items}
        trigger={
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save as Template
          </Button>
        }
      />
      
      <LoadTemplateDialog 
        onTemplateSelected={onTemplateSelected}
        trigger={
          <Button variant="outline" size="sm">
            <FileUp className="mr-2 h-4 w-4" />
            Load Template
          </Button>
        }
      />
      
      <Button variant="outline" size="sm" asChild>
        <Link to="/wholesale-orders/templates">
          <FileText className="mr-2 h-4 w-4" />
          Manage Templates
        </Link>
      </Button>
    </div>
  );
}
