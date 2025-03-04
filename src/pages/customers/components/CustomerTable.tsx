
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, Phone, Mail, MapPin, FileText } from "lucide-react";
import { Customer } from "../types";
import { CustomerEditDialog } from "./CustomerEditDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface CustomerTableProps {
  customers: Customer[];
  onAddCustomer: (customer: Partial<Customer>) => void;
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerTable({ 
  customers, 
  onAddCustomer, 
  onUpdateCustomer, 
  onDeleteCustomer 
}: CustomerTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    setEditDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    console.log("Editing customer:", customer);
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setViewDetailsOpen(true);
  };

  const handleSave = (customerData: Partial<Customer>) => {
    if (selectedCustomer) {
      console.log("Updating customer:", selectedCustomer.id, customerData);
      onUpdateCustomer(selectedCustomer.id, customerData);
    } else {
      console.log("Adding new customer:", customerData);
      onAddCustomer(customerData);
    }
    setEditDialogOpen(false);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      onDeleteCustomer(selectedCustomer.id);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Contact</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium cursor-pointer text-center" onClick={() => handleViewDetails(customer)}>
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone size={14} /> {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail size={14} /> {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      customer.type === 'commercial' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(customer)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Edit Dialog */}
      <CustomerEditDialog
        customer={selectedCustomer}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Customer Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Name:</div>
                <div>{selectedCustomer.name}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium">Type:</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedCustomer.type === 'commercial' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedCustomer.type.charAt(0).toUpperCase() + selectedCustomer.type.slice(1)}
                  </span>
                </div>
              </div>
              {selectedCustomer.phone && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Phone:</div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} /> {selectedCustomer.phone}
                  </div>
                </div>
              )}
              {selectedCustomer.email && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Email:</div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} /> {selectedCustomer.email}
                  </div>
                </div>
              )}
              {selectedCustomer.address && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Address:</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} /> {selectedCustomer.address}
                  </div>
                </div>
              )}
              {selectedCustomer.notes && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium">Notes:</div>
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="mt-1 flex-shrink-0" /> 
                    <div>{selectedCustomer.notes}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
            {selectedCustomer && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setViewDetailsOpen(false);
                  handleEdit(selectedCustomer);
                }}
              >
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
