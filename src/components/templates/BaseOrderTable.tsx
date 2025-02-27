
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  const hasActiveFilters = Object.keys(columnFilters).length > 0;

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
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          {hasActiveFilters ? 
            `Filters (${Object.keys(columnFilters).length})` : 
            "Filters"
          }
        </Button>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="p-4 border rounded-md shadow-sm bg-white">
          <h3 className="text-sm font-medium mb-3">Filter by column</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {headers.filter(header => header.key !== 'actions').map(header => (
              <div key={header.key} className="space-y-1">
                <label 
                  htmlFor={`filter-${header.key}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {header.label}
                </label>
                <Input
                  id={`filter-${header.key}`}
                  placeholder={`Filter ${header.label}...`}
                  value={columnFilters[header.key] || ''}
                  onChange={(e) => handleColumnFilterChange(header.key, e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setColumnFilters({})}
              className="mr-2"
            >
              Clear All
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowFiltersPanel(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

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
                        <span className="ml-1 text-xs bg-primary/20 text-primary py-0.5 px-1 rounded">
                          Filtered
                        </span>
                      )}
                    </span>
                    {header.sortable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleSort(header.key)}
                      >
                        <ArrowUpDown className="h-4 w-4" />
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
      
      {(filter || hasActiveFilters) && filteredData.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing {filteredData.length} of {data.length} items
        </div>
      )}
    </div>
  );
}
