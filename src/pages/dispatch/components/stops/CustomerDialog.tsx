
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "./types";
import { Search } from "lucide-react";

interface CustomerDialogProps {
  onSelect: (customer: Customer) => void;
  onCancel: () => void;
  selectedCustomerId?: string;
  customers: Customer[];
}

export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  onSelect,
  onCancel,
  selectedCustomerId,
  customers
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(customer => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(lowerSearchTerm) ||
      (customer.address && customer.address.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.phone && customer.phone.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(lowerSearchTerm))
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search customers..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto max-h-[400px] border rounded-md">
        {filteredCustomers.length > 0 ? (
          <div className="divide-y">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`p-3 hover:bg-muted cursor-pointer ${
                  selectedCustomerId === customer.id ? "bg-muted" : ""
                }`}
                onClick={() => onSelect(customer)}
              >
                <div className="font-medium">{customer.name}</div>
                {customer.address && <div className="text-sm text-muted-foreground">{customer.address}</div>}
                {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">No customers found</div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
