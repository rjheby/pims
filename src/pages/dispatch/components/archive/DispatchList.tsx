
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DispatchCard } from "./DispatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { DispatchFilters } from "./DispatchFilters";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface DispatchSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DispatchListProps {
  schedules: DispatchSchedule[];
  onEdit: (scheduleId: string) => void;
  onDuplicate: (schedule: DispatchSchedule) => void;
  onDownload: (schedule: DispatchSchedule) => void;
  onCopyLink: (scheduleId: string) => void;
  onShare: (scheduleId: string, method: 'email' | 'sms') => void;
  onDelete: (scheduleId: string) => void;
}

export function DispatchList({ 
  schedules, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onCopyLink, 
  onShare,
  onDelete 
}: DispatchListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: {
      from: null,
      to: null
    }
  });

  const filteredSchedules = schedules.filter(schedule => {
    let matchesFilter = true;
    
    if (filters.status && schedule.status !== filters.status) {
      matchesFilter = false;
    }
    
    if (filters.dateRange.from && new Date(schedule.created_at) < new Date(filters.dateRange.from)) {
      matchesFilter = false;
    }
    if (filters.dateRange.to && new Date(schedule.created_at) > new Date(filters.dateRange.to)) {
      matchesFilter = false;
    }
    
    return matchesFilter;
  });

  const searchedSchedules = filteredSchedules.filter(schedule => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (schedule.schedule_number && schedule.schedule_number.toLowerCase().includes(searchLower)) ||
      (schedule.status && schedule.status.toLowerCase().includes(searchLower)) ||
      (schedule.notes && schedule.notes.toLowerCase().includes(searchLower)) ||
      (format(new Date(schedule.schedule_date), "MMM d, yyyy").toLowerCase().includes(searchLower))
    );
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterApply = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const isFiltersActive = filters.status || filters.dateRange.from || filters.dateRange.to;

  // Count the number of active filters
  const activeFilterCount = [
    filters.status, 
    filters.dateRange.from, 
    filters.dateRange.to
  ].filter(Boolean).length;

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No dispatch schedules found. Create your first schedule to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          variant={isFiltersActive ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowFilters(true)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-primary-foreground text-primary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Filters Sidebar */}
      <DispatchFilters 
        open={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters} 
        onApplyFilters={handleFilterApply}
      />
      
      {/* Active Filters Display */}
      {isFiltersActive && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.status && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              Status: {filters.status}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => setFilters({...filters, status: ""})}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange.from && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              From: {format(filters.dateRange.from, "PP")}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => setFilters({
                  ...filters, 
                  dateRange: {...filters.dateRange, from: null}
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange.to && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              To: {format(filters.dateRange.to, "PP")}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => setFilters({
                  ...filters, 
                  dateRange: {...filters.dateRange, to: null}
                })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-muted-foreground" 
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
      
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {searchedSchedules.length} of {schedules.length} schedules
        {searchTerm && <span> (search: "{searchTerm}")</span>}
        {isFiltersActive && <span> (filtered)</span>}
      </div>
      
      {searchedSchedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No schedules match your search or filters. Try adjusting your criteria.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchedSchedules.map((schedule) => (
            <DispatchCard
              key={schedule.id}
              schedule={schedule}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDownload={onDownload}
              onCopyLink={onCopyLink}
              onShare={onShare}
              onDelete={onDelete}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
