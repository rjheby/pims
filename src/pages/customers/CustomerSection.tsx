
import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Customer } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerMobileCard } from "./CustomerMobileCard";
import { useNavigate } from "react-router-dom";

interface CustomerSectionProps {
  title: string;
  customers: Customer[];
  onAddCustomer: (customerData: Partial<Customer>) => void;
  onUpdateCustomer: (customerId: string, customerData: Partial<Customer>) => void;
  onDeleteCustomer: (customerId: string) => void;
}

export function CustomerSection({
  title,
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleEditCustomer = (customerId: string) => {
    navigate(`/customers?edit=${customerId}`);
  };

  if (isMobile) {
    return (
      <div className="mb-8">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center cursor-pointer">
                {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                <h3 className="text-lg font-medium">{title} ({customers.length})</h3>
              </div>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-3">
            {customers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers found</p>
            ) : (
              customers.map(customer => (
                <CustomerMobileCard
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEditCustomer}
                  onDelete={onDeleteCustomer}
                />
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
  
  // Desktop view
  return (
    <div className="mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center cursor-pointer">
              {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              <h3 className="text-lg font-medium">{title} ({customers.length})</h3>
            </div>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          {customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customers found</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customers.map(customer => (
                <div key={customer.id} className="rounded-md border p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold truncate">{customer.name}</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteCustomer(customer.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    {customer.phone && <p className="truncate">{customer.phone}</p>}
                    {customer.email && <p className="truncate">{customer.email}</p>}
                    {customer.address && <p className="truncate">{customer.address}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
