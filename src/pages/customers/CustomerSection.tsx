
import { useState } from "react";
import { Customer } from "./types";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerMobileCard } from "./CustomerMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerSectionProps {
  title: string;
  customers: Customer[];
  onAddCustomer: (customer: Partial<Customer>) => void;
  onUpdateCustomer: (id: string, data: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
  onDuplicateCustomer?: (customer: Customer) => void;
}

export function CustomerSection({ 
  title, 
  customers, 
  onUpdateCustomer, 
  onDeleteCustomer,
  onAddCustomer,
  onDuplicateCustomer
}: CustomerSectionProps) {
  const isMobile = useIsMobile();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId(prev => prev === id ? null : id);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleSelectCustomer = (id: string, selected: boolean) => {
    setSelectedCustomers(prev => {
      if (selected) {
        return [...prev, id];
      } else {
        return prev.filter(customerId => customerId !== id);
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedCustomers(customers.map(customer => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedCustomers.length > 0 && onDuplicateCustomer) {
      selectedCustomers.forEach(id => {
        const customer = customers.find(c => c.id === id);
        if (customer) {
          onDuplicateCustomer(customer);
        }
      });
      setSelectedCustomers([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCustomers.length > 0) {
      selectedCustomers.forEach(id => {
        onDeleteCustomer(id);
      });
      setSelectedCustomers([]);
    }
  };

  return (
    <Card className="border rounded-lg overflow-hidden mb-4">
      <CardHeader 
        className="bg-muted py-3 px-4 cursor-pointer flex flex-row items-center justify-between" 
        onClick={toggleCollapse}
      >
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => {
          e.stopPropagation();
          toggleCollapse();
        }}>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="p-0">
          {selectedCustomers.length > 0 && (
            <div className="flex items-center justify-between bg-muted/40 p-2 border-b">
              <span className="text-sm font-medium">{selectedCustomers.length} selected</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDuplicateSelected}
                  disabled={!onDuplicateCustomer}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-4 w-4 mr-2"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          )}
          {isMobile ? (
            <div className="divide-y">
              {customers.map(customer => (
                <CustomerMobileCard
                  key={customer.id}
                  customer={customer}
                  expanded={expandedCustomerId === customer.id}
                  onToggleExpand={() => toggleExpand(customer.id)}
                  onUpdate={(data) => onUpdateCustomer(customer.id, data)}
                  onDelete={() => onDeleteCustomer(customer.id)}
                  onDuplicate={onDuplicateCustomer ? () => onDuplicateCustomer(customer) : undefined}
                  selected={selectedCustomers.includes(customer.id)}
                  onSelect={(selected) => handleSelectCustomer(customer.id, selected)}
                />
              ))}
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              onUpdateCustomer={onUpdateCustomer}
              onDeleteCustomer={onDeleteCustomer}
              onDuplicateCustomer={onDuplicateCustomer}
              selectedCustomers={selectedCustomers}
              onSelectCustomer={handleSelectCustomer}
              onSelectAll={handleSelectAll}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
