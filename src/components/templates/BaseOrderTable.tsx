
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

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

  const sortedAndFilteredData = useMemo(() => {
    let processedData = [...data];

    if (filter) {
      processedData = processedData.filter(item => 
        Object.values(item).some(value => 
          String(value).toLowerCase().includes(filter.toLowerCase())
        )
      );
    }

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
  }, [data, filter, sortConfig]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-end">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter table..."
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
      </div>
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
                    <span>{header.label}</span>
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
    </div>
  );
}
