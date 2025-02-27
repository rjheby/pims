
import { useState, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableHeader {
  key: string;
  label: string;
  sortable?: boolean;
}

interface BaseOrderTableProps {
  headers: TableHeader[];
  data: any[];
  children: ReactNode;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filter: string) => void;
}

export function BaseOrderTable({
  headers,
  data,
  children,
  onSortChange,
  onFilterChange
}: BaseOrderTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  const [filterValue, setFilterValue] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
    
    if (onSortChange) {
      onSortChange(key, direction);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" /> 
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">{data.length} Items</div>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter items..."
            className="pl-8 w-full"
            value={filterValue}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => (
                <TableHead key={header.key} className="font-medium text-left">
                  {header.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(header.key)}
                      className="p-0 h-auto font-medium text-sm hover:bg-transparent flex items-center"
                    >
                      {header.label}
                      {getSortIcon(header.key)}
                    </Button>
                  ) : (
                    header.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {children}
            {data.length === 0 && (
              <TableRow>
                <td colSpan={headers.length} className="text-center py-6 text-muted-foreground">
                  No items found. Add a new row to get started.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
