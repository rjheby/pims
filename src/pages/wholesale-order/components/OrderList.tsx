
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from "./OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { OrderFilters } from "./OrderFilters";

interface OrderListProps {
  orders: any[];
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
}

export function OrderList({ orders, onEdit, onDuplicate, onDownload, onCopyLink, onShare }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: {
      from: null,
      to: null
    },
    minTotal: "",
    maxTotal: ""
  });

  // Apply filters to orders
  const filteredOrders = orders.filter(order => {
    let matchesFilter = true;
    
    // Status filter
    if (filters.status && order.status !== filters.status) {
      matchesFilter = false;
    }
    
    // Date range filter
    if (filters.dateRange.from && new Date(order.created_at) < new Date(filters.dateRange.from)) {
      matchesFilter = false;
    }
    if (filters.dateRange.to && new Date(order.created_at) > new Date(filters.dateRange.to)) {
      matchesFilter = false;
    }
    
    // Min total filter
    if (filters.minTotal && order.total < Number(filters.minTotal)) {
      matchesFilter = false;
    }
    
    // Max total filter
    if (filters.maxTotal && order.total > Number(filters.maxTotal)) {
      matchesFilter = false;
    }
    
    return matchesFilter;
  });

  // Apply search to filtered orders
  const searchedOrders = filteredOrders.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search across multiple fields
    return (
      (order.order_number && order.order_number.toLowerCase().includes(searchLower)) ||
      (order.status && order.status.toLowerCase().includes(searchLower)) ||
      (order.customer && order.customer.toLowerCase().includes(searchLower)) ||
      (order.notes && order.notes.toLowerCase().includes(searchLower))
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
      },
      minTotal: "",
      maxTotal: ""
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const isFiltersActive = filters.status || filters.dateRange.from || filters.dateRange.to || 
                           filters.minTotal || filters.maxTotal;

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supplier orders found. Create your first order to get started.
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filter controls */}
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
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
        
        {/* Filter button */}
        <Button 
          variant={isFiltersActive ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isFiltersActive ? "Filters Active" : "Filters"}
          {isFiltersActive && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-medium text-primary">
              {Object.values(filters).filter(f => f !== "" && f !== null).length}
            </span>
          )}
        </Button>
        
        {isFiltersActive && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white">
          <OrderFilters 
            filters={filters} 
            onApplyFilters={handleFilterApply} 
            onClose={() => setShowFilters(false)} 
          />
        </div>
      )}
      
      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {searchedOrders.length} of {orders.length} orders
        {searchTerm && <span> (search: "{searchTerm}")</span>}
        {isFiltersActive && <span> (filtered)</span>}
      </div>
      
      {/* Order cards */}
      {searchedOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No orders match your search or filters. Try adjusting your criteria.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searchedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDownload={onDownload}
              onCopyLink={onCopyLink}
              onShare={onShare}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
