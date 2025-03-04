
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Customer } from "./types";
import { CustomerTable } from "./components/CustomerTable";

interface CustomerSectionProps {
  title: string;
  customers: Customer[];
  onAddCustomer: (customer: Partial<Customer>) => void;
  onUpdateCustomer: (id: string, customer: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export function CustomerSection({
  title,
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomerSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between bg-muted p-3 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold">{title} ({customers.length})</h2>
        <button className="p-1">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border border-t-0 rounded-b-lg">
          <CustomerTable
            customers={customers}
            onAddCustomer={onAddCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onDeleteCustomer={onDeleteCustomer}
          />
        </div>
      )}
    </div>
  );
}
