
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface FilterProps {
  filters: {
    status: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
    minTotal: string;
    maxTotal: string;
  };
  onApplyFilters: (filters: any) => void;
  onClose: () => void;
}

export function OrderFilters({ filters, onApplyFilters, onClose }: FilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Status options - extend these as needed
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const handleChange = (name: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: Date | null) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const resetFilters = () => {
    setLocalFilters({
      status: "",
      dateRange: {
        from: null,
        to: null
      },
      minTotal: "",
      maxTotal: ""
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={localFilters.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Date Range Filter - From */}
        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateRange.from ? (
                  format(localFilters.dateRange.from, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.dateRange.from || undefined}
                onSelect={(date) => handleDateRangeChange("from", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Date Range Filter - To */}
        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateRange.to ? (
                  format(localFilters.dateRange.to, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={localFilters.dateRange.to || undefined}
                onSelect={(date) => handleDateRangeChange("to", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Price Range Filter */}
        <div className="space-y-2">
          <Label>Total Value Range</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.minTotal}
              onChange={(e) => handleChange("minTotal", e.target.value)}
              className="w-1/2"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.maxTotal}
              onChange={(e) => handleChange("maxTotal", e.target.value)}
              className="w-1/2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
