import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { DispatchFilters } from "./components/DispatchFilters";
import { Badge } from "@/components/ui/badge";

interface MasterSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  stop_count?: number;
}

export default function DispatchArchive() {
  const [schedules, setSchedules] = useState<MasterSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: {
      from: null,
      to: null
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setLoading(true);
        
        // Fetch master schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from("dispatch_schedules")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (schedulesError) {
          throw schedulesError;
        }

        if (!schedulesData) {
          setSchedules([]);
          return;
        }

        // For each master schedule, get the count of stops
        for (const schedule of schedulesData) {
          const { count, error } = await supabase
            .from("delivery_schedules")
            .select("*", { count: 'exact', head: true })
            .eq("master_schedule_id", schedule.id);
            
          schedule.stop_count = count || 0;
        }
        
        setSchedules(schedulesData);
      } catch (error) {
        console.error("Error fetching schedules:", error);
        toast({
          title: "Error",
          description: "Failed to load dispatch schedules",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, [toast]);

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

  // Apply filters
  const filteredSchedules = schedules.filter(schedule => {
    let matchesFilter = true;
    
    if (filters.status && schedule.status !== filters.status) {
      matchesFilter = false;
    }
    
    if (filters.dateRange.from && new Date(schedule.schedule_date) < new Date(filters.dateRange.from)) {
      matchesFilter = false;
    }
    if (filters.dateRange.to && new Date(schedule.schedule_date) > new Date(filters.dateRange.to)) {
      matchesFilter = false;
    }
    
    return matchesFilter;
  });

  // Apply search
  const searchedSchedules = filteredSchedules.filter(schedule => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (schedule.schedule_number && schedule.schedule_number.toLowerCase().includes(searchLower)) ||
      (schedule.status && schedule.status.toLowerCase().includes(searchLower)) ||
      (schedule.notes && schedule.notes.toLowerCase().includes(searchLower))
    );
  });

  const isFiltersActive = filters.status || filters.dateRange.from || filters.dateRange.to;

  // Count the number of active filters
  const activeFilterCount = [
    filters.status, 
    filters.dateRange.from, 
    filters.dateRange.to
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispatch Schedules</h1>
        <Button asChild className="bg-[#2A4131] hover:bg-[#2A4131]/90">
          <Link to="/dispatch">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Dispatch Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          
          {/* Filters Component */}
          <DispatchFilters 
            open={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters} 
            onApplyFilters={handleFilterApply}
          />
          
          {/* Results count */}
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {searchedSchedules.length} of {schedules.length} schedules
            {searchTerm && <span> (search: "{searchTerm}")</span>}
            {isFiltersActive && <span> (filtered)</span>}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : searchedSchedules.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No dispatch schedules found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Schedule #</TableHead>
                    <TableHead className="text-center">Date</TableHead>
                    <TableHead className="text-center">Stops</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchedSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="text-center font-medium">{schedule.schedule_number}</TableCell>
                      <TableCell className="text-center">{format(new Date(schedule.schedule_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-center">{schedule.stop_count}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          schedule.status === "submitted" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {schedule.status === "submitted" ? "Submitted" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {format(new Date(schedule.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/dispatch-form/${schedule.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
