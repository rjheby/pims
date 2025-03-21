
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";

interface CustomerSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
}) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="relative flex-1 mr-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button 
        onClick={onAddNew} 
        variant="outline"
        size="sm"
        className="whitespace-nowrap"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        New Customer
      </Button>
    </div>
  );
};
