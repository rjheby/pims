
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ExternalLink, Mail, Phone } from "lucide-react";
import { Customer } from "../types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomerTableProps {
  customers: Customer[];
  onUpdateCustomer: (id: string, data: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onDuplicateCustomer?: (customer: Customer) => void;
  selectedCustomers?: string[];
  onSelectCustomer?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function CustomerTable({ 
  customers, 
  onUpdateCustomer, 
  onDeleteCustomer,
  onDuplicateCustomer,
  selectedCustomers = [],
  onSelectCustomer,
  onSelectAll
}: CustomerTableProps) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>(-1);

  const handleEditClick = (id: string) => {
    navigate(`/customers?edit=${id}`);
  };

  const confirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (customerToDelete) {
      onDeleteCustomer(customerToDelete.id);
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleDuplicate = (customer: Customer) => {
    if (onDuplicateCustomer) {
      onDuplicateCustomer(customer);
    }
  };

  const showDetails = (customer: Customer) => {
    setDetailsCustomer(customer);
    setDetailsOpen(true);
  };

  const handleSelectCustomer = (customerId: string, index: number, isChecked: boolean, isShiftKey: boolean) => {
    if (!onSelectCustomer) return;
    
    onSelectCustomer(customerId, isChecked);
    
    if (isShiftKey && lastSelectedIndex >= 0 && index !== lastSelectedIndex) {
      const start = Math.min(index, lastSelectedIndex);
      const end = Math.max(index, lastSelectedIndex);
      
      for (let i = start; i <= end; i++) {
        if (i !== index && i !== lastSelectedIndex) {
          onSelectCustomer(customers[i].id, isChecked);
        }
      }
    }
    
    setLastSelectedIndex(index);
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (onSelectAll) {
      onSelectAll(isChecked);
    }
  };

  // Keyboard event handler for navigation and actions
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Implementation of keyboard shortcuts can be added here
    if (e.key === 'Delete' && selectedCustomers.length > 0) {
      // Handle bulk delete
      console.log('Bulk delete triggered for', selectedCustomers);
    }
  }, [selectedCustomers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const isAllSelected = customers.length > 0 && selectedCustomers.length === customers.length;

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectCustomer && (
                <TableHead className="w-[50px] text-center">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Contact</TableHead>
              <TableHead className="text-center">Location</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                {onSelectCustomer && (
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => {
                        handleSelectCustomer(
                          customer.id, 
                          index, 
                          !!checked, 
                          window.event instanceof MouseEvent && (window.event as MouseEvent).shiftKey
                        );
                      }}
                      aria-label={`Select ${customer.name}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium text-center">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-medium"
                    onClick={() => showDetails(customer)}
                  >
                    {customer.name}
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={customer.type === "commercial" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                    {customer.type === "commercial" ? "Commercial" : "Residential"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} className="text-primary hover:underline flex items-center" title={customer.email}>
                        <Mail className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Email</span>
                      </a>
                    )}
                    {customer.phone && (
                      <a href={`tel:${customer.phone}`} className="text-primary hover:underline flex items-center" title={customer.phone}>
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Call</span>
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {[customer.city, customer.state].filter(Boolean).join(", ") || "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(customer.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDuplicateCustomer && (
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicate(customer)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="8" y="8" width="12" height="12" rx="2" ry="2" />
                          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(customer)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {customerToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailsCustomer?.name}</DialogTitle>
            <Badge variant="outline" className={detailsCustomer?.type === "commercial" ? "bg-blue-50 text-blue-700 mt-2 w-fit" : "bg-green-50 text-green-700 mt-2 w-fit"}>
              {detailsCustomer?.type === "commercial" ? "Commercial" : "Residential"}
            </Badge>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {detailsCustomer?.phone && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Phone</div>
                <div className="col-span-3">
                  <a href={`tel:${detailsCustomer.phone}`} className="text-primary hover:underline">
                    {detailsCustomer.phone}
                  </a>
                </div>
              </div>
            )}
            
            {detailsCustomer?.email && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email</div>
                <div className="col-span-3">
                  <a href={`mailto:${detailsCustomer.email}`} className="text-primary hover:underline">
                    {detailsCustomer.email}
                  </a>
                </div>
              </div>
            )}
            
            {detailsCustomer?.street_address && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Address</div>
                <div className="col-span-3">
                  <p>{detailsCustomer.street_address}</p>
                  <p>
                    {[detailsCustomer.city, detailsCustomer.state, detailsCustomer.zip_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
            
            {detailsCustomer?.notes && (
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="font-medium">Notes</div>
                <div className="col-span-3">{detailsCustomer.notes}</div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            <Button onClick={() => {
              setDetailsOpen(false);
              handleEditClick(detailsCustomer?.id || "");
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
