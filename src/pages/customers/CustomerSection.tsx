
import { useState } from "react";
import { Customer } from "./types";
import { CustomerTable } from "./components/CustomerTable";
import { CustomerMobileCard } from "./CustomerMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerSectionProps {
  title: string;
  customers: Customer[];
  onAddCustomer: (customer: Partial<Customer>) => void;
  onUpdateCustomer: (id: string, data: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerSection({ title, customers, onUpdateCustomer, onDeleteCustomer }: CustomerSectionProps) {
  const isMobile = useIsMobile();
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId(prev => prev === id ? null : id);
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
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
                />
              ))}
            </div>
          ) : (
            <CustomerTable
              customers={customers}
              onUpdateCustomer={onUpdateCustomer}
              onDeleteCustomer={onDeleteCustomer}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
