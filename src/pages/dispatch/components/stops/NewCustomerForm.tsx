
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer } from "./types";

interface NewCustomerFormProps {
  onCreateCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export const NewCustomerForm: React.FC<NewCustomerFormProps> = ({
  onCreateCustomer,
  onCancel,
}) => {
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    type: 'RETAIL',
    address: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async () => {
    await onCreateCustomer(newCustomer);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Name *</Label>
          <Input 
            id="customerName" 
            value={newCustomer.name} 
            onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerType">Type *</Label>
          <Select 
            value={newCustomer.type} 
            onValueChange={(value) => setNewCustomer({...newCustomer, type: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="RETAIL">Retail</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerAddress">Address</Label>
          <Input 
            id="customerAddress" 
            value={newCustomer.address || ''} 
            onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone</Label>
          <Input 
            id="customerPhone" 
            value={newCustomer.phone || ''} 
            onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email</Label>
          <Input 
            id="customerEmail" 
            value={newCustomer.email || ''} 
            onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Customer</Button>
      </DialogFooter>
    </>
  );
};
