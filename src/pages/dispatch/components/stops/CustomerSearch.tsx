
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus } from "lucide-react";

interface CustomerSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  debounceTime?: number;
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchValue,
  onSearchChange,
  onAddNew,
  debounceTime = 300
}) => {
  const [inputValue, setInputValue] = useState(searchValue);

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  // Debounce search input
  useEffect(() => {
    // Only create timer if the input value is different from the current search value
    if (inputValue !== searchValue) {
      const timer = setTimeout(() => {
        onSearchChange(inputValue);
      }, debounceTime);
      
      // Clean up timer on component unmount or when input changes again
      return () => clearTimeout(timer);
    }
  }, [inputValue, searchValue, onSearchChange, debounceTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="flex justify-between mb-4">
      <div className="relative flex-1 mr-2">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={inputValue}
          onChange={handleInputChange}
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
