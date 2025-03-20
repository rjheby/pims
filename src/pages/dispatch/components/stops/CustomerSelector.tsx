
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useDebounce } from "../../../../hooks/useDebounce";

// Cache for storing previously loaded customers
const customersCache: Record<string, { data: Customer[], timestamp: number }> = {};
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void;
  onCancel: () => void;
  initialCustomerId?: string | null;
}

export const CustomerSelector = ({
  onSelect,
  onCancel,
  initialCustomerId
}: CustomerSelectorProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedId, setSelectedId] = useState<string | null>(initialCustomerId || null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    type: 'RETAIL',
    address: '',
    phone: '',
    email: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Function to construct address from components
  const constructAddress = useCallback((customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  }, []);

  // Check for cached data and fetch if needed
  const fetchCustomers = useCallback(async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      
      // Create a cache key based on pagination and search
      const cacheKey = `customers_page${page}_search${searchTerm}`;
      const now = Date.now();
      
      // Check if we have valid cached data
      if (customersCache[cacheKey] && (now - customersCache[cacheKey].timestamp) < CACHE_EXPIRY_TIME) {
        console.log("Using cached customer data for:", cacheKey);
        setCustomers(customersCache[cacheKey].data);
        setLoading(false);
        return;
      }
      
      // Calculate pagination range
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      // Build query
      let query = supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code', { count: 'exact' });
      
      // Add search filter if search term is provided
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      
      // Add pagination
      const { data, error, count } = await query
        .order('name')
        .range(from, to);
        
      if (error) {
        throw error;
      }

      // Calculate total pages
      if (count !== null) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      // Process customer data
      const processedCustomers = data.map((customer) => ({
        ...customer,
        type: customer.type || 'RETAIL',
        address: customer.address || constructAddress(customer),
      }));
      
      // Cache the results
      customersCache[cacheKey] = {
        data: processedCustomers,
        timestamp: now
      };
      
      setCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Error",
        description: "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [constructAddress]);

  // Fetch initial data or when page changes
  useEffect(() => {
    fetchCustomers(currentPage, debouncedSearch);
  }, [fetchCustomers, currentPage, debouncedSearch]);

  // If an initial customer ID is provided, fetch and select that customer
  useEffect(() => {
    const fetchInitialCustomer = async () => {
      if (initialCustomerId) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
            .eq('id', initialCustomerId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setSelectedId(data.id);
            // Add to full list if not already there
            setCustomers(prev => {
              if (!prev.some(c => c.id === data.id)) {
                return [...prev, {
                  ...data,
                  type: data.type || 'RETAIL',
                  address: data.address || constructAddress(data)
                }];
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Error fetching initial customer:", error);
        }
      }
    };
    
    fetchInitialCustomer();
  }, [initialCustomerId, constructAddress]);

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Memoized customer selection
  const handleConfirm = useCallback(() => {
    if (!selectedId) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedId);
    if (selectedCustomer) {
      onSelect(selectedCustomer);
    }
  }, [selectedId, customers, onSelect]);

  // Create new customer with optimized error handling
  const handleCreateCustomer = async () => {
    if (!newCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use the add_customer function
      const { data, error } = await supabase
        .rpc('add_customer', {
          customer_name: newCustomer.name,
          customer_phone: newCustomer.phone || null,
          customer_email: newCustomer.email || null,
          customer_address: newCustomer.address || null,
          customer_type: newCustomer.type
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create customer: " + error.message,
          variant: "destructive"
        });
        return;
      }

      const newCustomerId = data;
      
      // Fetch the newly created customer to get all fields
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .eq('id', newCustomerId)
        .single();
        
      if (customerError) {
        toast({
          title: "Error",
          description: "Customer created but couldn't fetch details",
          variant: "destructive"
        });
        return;
      }

      // Process the customer data to ensure it has all expected fields
      const newCustomerWithAllFields = {
        ...customerData,
        type: customerData.type || 'RETAIL',
        address: customerData.address || constructAddress(customerData),
      };
      
      // Update cache and state
      Object.keys(customersCache).forEach(key => {
        if (key.startsWith('customers_page')) {
          delete customersCache[key]; // Invalidate cache
        }
      });
      
      setCustomers(prev => [newCustomerWithAllFields, ...prev]);
      setSelectedId(newCustomerId);
      setShowNewCustomerDialog(false);
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      });
      
      // Select the new customer immediately with all fields
      onSelect(newCustomerWithAllFields);
    } catch (err) {
      console.error("Error creating customer:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  // Pagination controls rendering
  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {/* First page */}
          {currentPage > 2 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis */}
          {currentPage > 3 && (
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            </PaginationItem>
          )}
          
          {/* Previous page */}
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Current page */}
          <PaginationItem>
            <PaginationLink isActive>{currentPage}</PaginationLink>
          </PaginationItem>
          
          {/* Next page */}
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {/* Ellipsis */}
          {currentPage < totalPages - 2 && (
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            </PaginationItem>
          )}
          
          {/* Last page */}
          {currentPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => handlePageChange(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }, [currentPage, totalPages]);

  // Render customer list with selection
  const renderCustomerList = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (customers.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          {debouncedSearch ? "No customers found matching your search." : "No customers found."}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className={`
              p-3 rounded-md cursor-pointer border transition-colors
              ${selectedId === customer.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}
            `}
            onClick={() => setSelectedId(customer.id)}
          >
            <div className="font-medium">{customer.name || "Unnamed Customer"}</div>
            {customer.address && (
              <div className="text-sm text-muted-foreground">{customer.address}</div>
            )}
            {customer.phone && (
              <div className="text-sm text-muted-foreground">{customer.phone}</div>
            )}
          </div>
        ))}
      </div>
    );
  }, [customers, loading, selectedId, debouncedSearch]);

  return (
    <div className="max-h-[60vh] flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button 
          onClick={() => setShowNewCustomerDialog(true)} 
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 max-h-[40vh]">
        {renderCustomerList}
      </div>
      
      {renderPagination}
      
      <div className="flex justify-end space-x-2 mt-auto pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedId}>
          Confirm Selection
        </Button>
      </div>

      {/* Add New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input 
                id="customerName" 
                value={newCustomer.name} 
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerType">Type *</Label>
              <Select 
                value={newCustomer.type} 
                onValueChange={(value) => setNewCustomer({...newCustomer, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="RETAIL">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Input 
                id="customerAddress" 
                value={newCustomer.address || ''} 
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input 
                id="customerPhone" 
                value={newCustomer.phone || ''} 
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input 
                id="customerEmail" 
                value={newCustomer.email || ''} 
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewCustomerDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer}>Create Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
