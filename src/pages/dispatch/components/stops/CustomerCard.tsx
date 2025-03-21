
import React from "react";
import { Customer } from "./types";
import { getPopularityScore } from "./CustomerUtils";

interface CustomerCardProps {
  customer: Customer;
  isSelected: boolean;
  onClick: () => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  isSelected,
  onClick,
}) => {
  const popularityScore = getPopularityScore(customer.name);
  
  return (
    <div
      className={`
        p-3 rounded-md cursor-pointer border
        ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}
        ${popularityScore > 0 ? 'border-yellow-300' : ''}
      `}
      onClick={onClick}
    >
      <div className="font-medium">
        {customer.name || "Unnamed Customer"}
        {popularityScore > 0 && (
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
            Popular
          </span>
        )}
      </div>
      {customer.address && (
        <div className="text-sm text-muted-foreground">{customer.address}</div>
      )}
      {customer.phone && (
        <div className="text-sm text-muted-foreground">{customer.phone}</div>
      )}
    </div>
  );
};
