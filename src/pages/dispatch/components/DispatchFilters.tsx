
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  // Reset local filters when the parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleStatusChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      status: value
    });
  };
  
  const handleDateRangeChange = (field: 'from' | 'to', value: Date | null) => {
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: value
      }
    });
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      status: "",
      dateRange: {
        from: null,
        to: null
      }
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Schedules</SheetTitle>
          <SheetDescription>
            Apply filters to narrow down your schedules
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Status Filter */}
          <div className="space-y-4">
            <Label className="text-base">Schedule Status</Label>
            <RadioGroup 
              value={localFilters.status} 
              onValueChange={handleStatusChange}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="status-all" />
                <Label htmlFor="status-all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="draft" id="status-draft" />
                <Label htmlFor="status-draft">Draft</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="submitted" id="status-submitted" />
                <Label htmlFor="status-submitted">Submitted</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Date Range Filter */}
          <div className="space-y-4">
            <Label className="text-base">Schedule Date Range</Label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-2">
                <Label htmlFor="from-date">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="from-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.from ? (
                        format(localFilters.dateRange.from, "PP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange.from || undefined}
                      onSelect={(date) => handleDateRangeChange('from', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* To Date */}
              <div className="space-y-2">
                <Label htmlFor="to-date">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="to-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !localFilters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.to ? (
                        format(localFilters.dateRange.to, "PP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={localFilters.dateRange.to || undefined}
                      onSelect={(date) => handleDateRangeChange('to', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 mt-6">
          <Button 
            onClick={handleApply} 
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Reset Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
