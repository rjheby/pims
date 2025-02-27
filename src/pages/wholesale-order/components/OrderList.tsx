
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { OrderCard } from "./OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X } from "lucide-react";
import { OrderFilters } from "./OrderFilters";
import { Badge } from "@/components/ui/badge";

interface OrderListProps {
  orders: any[];
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
  onDelete: (orderId: string) => void;
}

export function OrderList({ 
  orders, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onCopyLink, 
  onShare,
  onDelete 
}: OrderListProps) {
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

  const filteredOrders = orders.filter(order => {
    let matchesFilter = true;
    
    if (filters.status && order.status !== filters.status) {
      matchesFilter = false;
    }
    
    if (filters.dateRange.from && new Date(order.created_at) < new Date(filters.dateRange.from)) {
      matchesFilter = false;
    }
    if (filters.dateRange.to && new Date(order.created_at) > new Date(filters.dateRange.to)) {
      matchesFilter = false;
    }
    
    if (filters.minTotal && order.total < Number(filters.minTotal)) {
      matchesFilter = false;
    }
    
    if (filters.maxTotal && order.total > Number(filters.maxTotal)) {
      matchesFilter = false;
    }
    
    return matchesFilter;
  });

  const searchedOrders = filteredOrders.filter(order => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
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

  // Count the number of active filters
  const activeFilterCount = [
    filters.status, 
    filters.dateRange.from, 
    filters.dateRange.to, 
    filters.minTotal, 
    filters.maxTotal
  ].filter(Boolean).length;

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supplier orders found. Create your first order to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
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
      <OrderFilters 
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
          
          {filters.minTotal && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              Min Total: ${filters.minTotal}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => setFilters({...filters, minTotal: ""})}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.maxTotal && (
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              Max Total: ${filters.maxTotal}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => setFilters({...filters, maxTotal: ""})}
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
        Showing {searchedOrders.length} of {orders.length} orders
        {searchTerm && <span> (search: "{searchTerm}")</span>}
        {isFiltersActive && <span> (filtered)</span>}
      </div>
      
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
              onDelete={onDelete}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}
