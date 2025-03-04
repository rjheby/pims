import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterProps {
  open: boolean;
  onClose: () => void;
  filters: {
    status: string;
    dateRange: {
      from: Date | null;
      to: Date | null;
    };
  };
  onApplyFilters: (filters: any) => void;
}

export function DispatchFilters({ open, onClose, filters, onApplyFilters }: FilterProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" }
  ];

  // Reset local filters when parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
    const resetFiltersObj = {
      status: "",
      dateRange: {
        from: null,
        to: null
      }
    };
    
    setLocalFilters(resetFiltersObj);
    onApplyFilters(resetFiltersObj);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Schedules</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your schedule list
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Status Filter */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${option.value}`}
                    checked={localFilters.status === option.value}
                    onCheckedChange={() => handleChange("status", option.value === localFilters.status ? "" : option.value)}
                  />
                  <Label 
                    htmlFor={`status-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Date Range</h3>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">From</Label>
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
                
                <div className="space-y-2">
                  <Label className="text-xs">To</Label>
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
              </div>
              
              {localFilters.dateRange.from && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => handleDateRangeChange("from", null)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear start date
                </Button>
              )}
              
              {localFilters.dateRange.to && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs" 
                  onClick={() => handleDateRangeChange("to", null)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear end date
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-6">
          <Button
            onClick={applyFilters}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={resetFilters}
          >
            Reset All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
