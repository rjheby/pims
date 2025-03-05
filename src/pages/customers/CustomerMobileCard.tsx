
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, ChevronDown, ChevronUp, Phone, Mail, MapPin } from "lucide-react";
import { Customer } from "./types";

interface CustomerMobileCardProps {
  customer: Customer;
  onEdit: (customerId: string) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerMobileCard({ customer, onEdit, onDelete }: CustomerMobileCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div onClick={toggleExpanded} className="flex items-center gap-2 cursor-pointer flex-1">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="font-medium truncate">
            {customer.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {customer.type === 'commercial' ? 'Commercial' : 'Residential'}
          </span>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 pt-0 grid gap-3">
          {customer.phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.email && (
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{customer.email}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{customer.address}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(customer.id)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(customer.id)}>
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
