
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ExternalLink, Mail, Phone } from "lucide-react";
import { Customer } from "../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CustomerTableProps {
  customers: Customer[];
  onUpdateCustomer: (id: string, data: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerTable({ customers, onUpdateCustomer, onDeleteCustomer }: CustomerTableProps) {
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

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

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={customer.type === "commercial" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                    {customer.type === "commercial" ? "Commercial" : "Residential"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {customer.email && (
                      <a href={`mailto:${customer.email}`} className="text-primary hover:underline flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Email</span>
                      </a>
                    )}
                    {customer.phone && (
                      <a href={`tel:${customer.phone}`} className="text-primary hover:underline flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Call</span>
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {[customer.city, customer.state].filter(Boolean).join(", ") || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(customer.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
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
    </>
  );
}
