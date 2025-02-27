import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, Search, X } from "lucide-react";
import { useState, useMemo, ReactElement } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function BaseOrderTable({ 
  children, 
  headers,
  data,
  onSortChange,
  onFilterChange 
}: BaseOrderTableProps) {
  const isMobile = useIsMobile();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    onSortChange?.(key, direction);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = item[key]?.toString().toLowerCase();
        return itemValue === value.toLowerCase();
      });
    });
  }, [data, activeFilters]);

  const processedData = useMemo(() => {
    return filteredData.map(item => ({
      ...item,
      highlighted: searchTerm ? 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ) : false
    }));
  }, [filteredData, searchTerm]);

  const getFilterOptions = (key: string) => {
    const uniqueValues = new Set(data.map(item => item[key]?.toString()).filter(Boolean));
    return Array.from(uniqueValues);
  };

  const FilterControls = () => (
    <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2`}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {isMobile && 
          <span className="text-sm text-muted-foreground">
            Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
          </span>
        }
      </div>
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2`}>
        {headers.map(header => (
          <div key={header.key} className={isMobile ? 'w-full' : 'w-32'}>
            <Select
              value={activeFilters[header.key] || ''}
              onValueChange={(value) => 
                setActiveFilters(prev => ({
                  ...prev,
                  [header.key]: value
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={`Filter ${header.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {header.label}</SelectItem>
                {getFilterOptions(header.key).map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
        {Object.keys(activeFilters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilters({})}
            className={`h-8 px-2 ${isMobile ? 'w-full' : ''}`}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full">
      <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-center'} gap-4`}>
        <div className={`relative ${isMobile ? 'w-full' : 'w-72'}`}>
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1.5 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isMobile ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
              </span>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            {showFilters && (
              <div className="border rounded-md p-4 space-y-4">
                <FilterControls />
              </div>
            )}
          </>
        ) : (
          <FilterControls />
        )}
      </div>

      <div className="overflow-x-auto rounded-md border w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead 
                  key={header.key}
                  className="px-2 whitespace-nowrap"
                  style={{
                    width: header.key === 'name' ? '22%' : 
                           header.key === 'pallets' ? '8%' :
                           header.key === 'unitCost' ? '10%' :
                           header.key === 'totalCost' ? '10%' :
                           header.key === 'actions' ? '10%' : '10%'
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
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return null;
              const itemId = (child as ReactElement<any>).props?.item?.id;
              const matchingItem = processedData.find(item => item.id === itemId);
              
              return React.cloneElement(child as ReactElement, {
                className: matchingItem?.highlighted ? 'bg-yellow-50' : undefined
              });
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
