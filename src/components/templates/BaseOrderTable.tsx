
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, X, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BaseOrderTableProps {
  children: React.ReactNode;
  headers: Array<{
    key: string;
    label: string;
    sortable?: boolean;
  }>;
  data: Array<Record<string, any>>;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filter: string) => void;
}

function getColumnWidth(key: string): string {
  const widths: Record<string, string> = {
    name: '22%',       // Longest - needs most space for item descriptions
    species: '10%',    // Medium importance
    length: '6%',      // Very short values - minimal space needed
    bundleType: '10%', // Medium importance
    thickness: '10%',  // Medium importance
    packaging: '8%',   // Short values
    pallets: '5%',     // Very short numeric values
    unitCost: '7%',    // Short currency values
    totalCost: '8%',   // Medium currency values
    actions: '14%'     // Second longest - needs space for multiple action buttons
  };
  return widths[key] || '10%';
}

export function BaseOrderTable({ 
  children, 
  headers,
  data,
  onSortChange,
  onFilterChange 
}: BaseOrderTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [filter, setFilter] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSortChange?.(key, direction);
  };

  const handleFilter = (value: string) => {
    setFilter(value);
    onFilterChange?.(value);
  };

  // Apply column filters
  const handleColumnFilterChange = (key: string, value: string) => {
    const newFilters = { ...columnFilters };
    
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setColumnFilters(newFilters);
  };

  // Clear a specific column filter
  const clearColumnFilter = (key: string) => {
    const newFilters = { ...columnFilters };
    delete newFilters[key];
    setColumnFilters(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setColumnFilters({});
    setFilter('');
    onFilterChange?.('');
  };

  const filteredData = useMemo(() => {
    let processedData = [...data];

    // Apply global search filter
    if (filter) {
      processedData = processedData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

    // Apply column-specific filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      processedData = processedData.filter(item => {
        const value = String(item[key] || '').toLowerCase();
        return value.includes(filterValue.toLowerCase());
      });
    });

    // Apply sorting
    if (sortConfig) {
      processedData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [data, filter, columnFilters, sortConfig]);

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const hasActiveFilters = Object.keys(columnFilters).length > 0 || filter;
  const activeFilterCount = Object.keys(columnFilters).length + (filter ? 1 : 0);

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search table..."
            value={filter}
            onChange={(e) => handleFilter(e.target.value)}
            className="pl-8"
          />
          {filter && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-6 w-6 p-0"
              onClick={() => handleFilter('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Filters Button */}
        <Button 
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm" 
          onClick={() => setShowFiltersPanel(true)}
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
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filter && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              Search: {filter}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleFilter('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {Object.entries(columnFilters).map(([key, value]) => (
            <Badge key={key} variant="outline" className="flex items-center gap-1 bg-background">
              {headers.find(h => h.key === key)?.label}: {value}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => clearColumnFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-muted-foreground" 
            onClick={clearAllFilters}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Sidebar */}
      <Sheet open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Items</SheetTitle>
            <SheetDescription>
              Apply filters to narrow down your items
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Global Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search All Fields</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all columns..."
                  value={filter}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Column Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Filter by Column</h3>
              <div className="space-y-4">
                {headers.filter(header => header.key !== 'actions').map(header => (
                  <div key={header.key} className="space-y-2">
                    <Label 
                      htmlFor={`filter-${header.key}`}
                      className="text-xs font-medium"
                    >
                      {header.label}
                    </Label>
                    <Input
                      id={`filter-${header.key}`}
                      placeholder={`Filter ${header.label.toLowerCase()}...`}
                      value={columnFilters[header.key] || ''}
                      onChange={(e) => handleColumnFilterChange(header.key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-6">
            <Button
              onClick={() => setShowFiltersPanel(false)}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={clearAllFilters}
            >
              Reset All Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="overflow-x-auto rounded-md border" style={{width: '100%'}}>
        <Table className="w-full table-fixed" style={{width: '100%'}}>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead 
                  key={header.key}
                  style={{
                    width: getColumnWidth(header.key),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {header.label}
                      {columnFilters[header.key] && (
                        <Badge className="ml-1 text-xs bg-primary/20 text-primary py-0.5 px-1">
                          Filtered
                        </Badge>
                      )}
                    </span>
                    {header.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(header.key)}
                      >
                        {getSortIcon(header.key)}
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
          </TableBody>
        </Table>
      </div>
      
      {filteredData.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No results match your search or filter criteria
        </div>
      )}
      
      {hasActiveFilters && filteredData.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing {filteredData.length} of {data.length} items
        </div>
      )}
    </div>
  );
}
