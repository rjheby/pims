
import { useState } from "react";
import { Customer } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash, Mail, Phone, MapPin, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

interface CustomerMobileCardProps {
  customer: Customer;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (data: Partial<Customer>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function CustomerMobileCard({ 
  customer, 
  expanded, 
  onToggleExpand, 
  onUpdate, 
  onDelete,
  onDuplicate,
  selected = false,
  onSelect
}: CustomerMobileCardProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleEditClick = () => {
    navigate(`/customers?edit=${customer.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setDeleteDialogOpen(false);
  };

  const handleViewDetails = () => {
    setDetailsOpen(true);
  };

  const hasAddress = customer.street_address || customer.city || customer.state || customer.zip_code;

  return (
    <div className="p-4 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {onSelect && (
            <Checkbox 
              checked={selected}
              onCheckedChange={(checked) => onSelect(!!checked)}
              className="mr-2"
              aria-label={`Select ${customer.name}`}
            />
          )}
          <div className="flex-1">
            <Button 
              variant="link" 
              className="p-0 h-auto text-base font-medium text-left justify-start" 
              onClick={handleViewDetails}
            >
              {customer.name}
            </Button>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={customer.type === "commercial" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                {customer.type === "commercial" ? "Commercial" : "Residential"}
              </Badge>
              {customer.city && customer.state && (
                <span className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {customer.city}, {customer.state}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2" 
          onClick={onToggleExpand}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {customer.email && (
              <a 
                href={`mailto:${customer.email}`} 
                className="flex items-center text-primary text-sm"
                title={customer.email}
              >
                <Mail className="h-4 w-4 mr-2" />
                {customer.email}
              </a>
            )}
            
            {customer.phone && (
              <a 
                href={`tel:${customer.phone}`} 
                className="flex items-center text-primary text-sm"
                title={customer.phone}
              >
                <Phone className="h-4 w-4 mr-2" />
                {customer.phone}
              </a>
            )}
          </div>
          
          {hasAddress && (
            <div className="text-sm space-y-1">
              <div className="font-medium">Address</div>
              {customer.street_address && <div>{customer.street_address}</div>}
              <div>
                {[customer.city, customer.state, customer.zip_code].filter(Boolean).join(", ")}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDeleteClick}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customer.name} from your customer database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{customer.name}</DialogTitle>
            <Badge variant="outline" className={customer.type === "commercial" ? "bg-blue-50 text-blue-700 mt-2 w-fit" : "bg-green-50 text-green-700 mt-2 w-fit"}>
              {customer.type === "commercial" ? "Commercial" : "Residential"}
            </Badge>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {customer.phone && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Phone</div>
                <div className="col-span-3">
                  <a href={`tel:${customer.phone}`} className="text-primary hover:underline">
                    {customer.phone}
                  </a>
                </div>
              </div>
            )}
            
            {customer.email && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email</div>
                <div className="col-span-3">
                  <a href={`mailto:${customer.email}`} className="text-primary hover:underline">
                    {customer.email}
                  </a>
                </div>
              </div>
            )}
            
            {hasAddress && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Address</div>
                <div className="col-span-3">
                  {customer.street_address && <p>{customer.street_address}</p>}
                  <p>
                    {[customer.city, customer.state, customer.zip_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
            
            {customer.notes && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Notes</div>
                <div className="col-span-3">{customer.notes}</div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setDetailsOpen(false);
              handleEditClick();
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
