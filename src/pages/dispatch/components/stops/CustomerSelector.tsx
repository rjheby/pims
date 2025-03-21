import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Define popular customers for priority sorting
const POPULAR_CUSTOMERS = [
  "paulie g",
  "numero 28 brooklyn",
  "sunday in brooklyn"
];

// Helper function to get popularity score (higher = more popular)
const getPopularityScore = (name: string): number => {
  const normalizedName = name.toLowerCase();
  const index = POPULAR_CUSTOMERS.findIndex(popular => 
    normalizedName.includes(popular.toLowerCase())
  );
  return index >= 0 ? POPULAR_CUSTOMERS.length - index : 0;
};

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
  const [totalCustomers, setTotalCustomers] = useState(0);
  const itemsPerPage = 10; // Show 10 customers per page

  // Memoize the constructAddress function to avoid recreation on every render
  const constructAddress = useCallback((customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  }, []);

  // Optimized function to fetch customers with minimal fields for display
  const fetchCustomersMinimal = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      console.log(`CustomerSelector: Fetching minimal customer data for page ${page}`);
      
      // First, get total count for pagination
      const { count, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error counting customers:", countError);
        toast({
          title: "Error",
          description: `Failed to count customers: ${countError.message}`,
          variant: "destructive"
        });
        return;
      }
      
      if (count !== null) {
        setTotalCustomers(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
      
      // Then fetch only the essential fields for the current page
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, street_address, city, state, zip_code')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('name');
        
      if (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: `Failed to fetch customers: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log(`CustomerSelector: Fetched ${data?.length || 0} customers for page ${page}`);

      // Process customers with minimal data
      const processedCustomers = data.map((customer) => ({
        ...customer,
        type: 'RETAIL', // Default type, will be loaded in full data if needed
        address: customer.address || constructAddress(customer),
        // These fields will be loaded later when needed
        phone: '',
        email: '',
        notes: ''
      }));
      
      // Sort by popularity first, then alphabetically
      const sortedCustomers = processedCustomers.sort((a, b) => {
        const scoreA = getPopularityScore(a.name);
        const scoreB = getPopularityScore(b.name);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score (more popular) first
        }
        
        // If popularity is the same, sort alphabetically
        return a.name.localeCompare(b.name);
      });
      
      setCustomers(sortedCustomers);
    } catch (error: any) {
      console.error("Error in fetchCustomersMinimal:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [constructAddress]);

  // Function to fetch complete customer data when selected
  const fetchCustomerDetails = useCallback(async (customerId: string) => {
    try {
      console.log(`CustomerSelector: Fetching complete data for customer ID ${customerId}`);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .eq('id', customerId)
        .single();
        
      if (error) {
        console.error("Error fetching customer details:", error);
        return null;
      }
      
      return {
        ...data,
        type: data.type || 'RETAIL',
        address: data.address || constructAddress(data),
      };
      
    } catch (error) {
      console.error("Error in fetchCustomerDetails:", error);
      return null;
    }
  }, [constructAddress]);

  // Initialize with first page of minimal data
  useEffect(() => {
    fetchCustomersMinimal(currentPage);
  }, [fetchCustomersMinimal, currentPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle search with pagination reset
  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
    
    if (searchValue.length > 0) {
      // When searching, we might want to fetch all results instead of paginating
      searchCustomers(searchValue);
    } else {
      // Reset to first page when clearing search
      setCurrentPage(1);
      fetchCustomersMinimal(1);
    }
  };
  
  // Search function
  const searchCustomers = async (searchTerm: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, street_address, city, state, zip_code')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('name');
        
      if (error) {
        console.error("Error searching customers:", error);
        toast({
          title: "Error",
          description: `Failed to search customers: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Search found ${data?.length || 0} customers`);
      
      const processedCustomers = data.map((customer) => ({
        ...customer,
        type: 'RETAIL', // Default type
        address: customer.address || constructAddress(customer),
        phone: '',
        email: '',
        notes: ''
      }));
      
      // Sort search results by popularity
      const sortedCustomers = processedCustomers.sort((a, b) => {
        const scoreA = getPopularityScore(a.name);
        const scoreB = getPopularityScore(b.name);
        
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        
        return a.name.localeCompare(b.name);
      });
      
      setCustomers(sortedCustomers);
      // For search results, don't paginate for now (could be enhanced later)
      setTotalPages(1);
    } catch (error: any) {
      console.error("Error in searchCustomers:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while searching customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    
    // When confirming selection, fetch complete customer data
    const selectedCustomer = customers.find(c => c.id === selectedId);
    
    if (selectedCustomer) {
      setLoading(true);
      
      try {
        // Fetch complete customer data
        const fullCustomerData = await fetchCustomerDetails(selectedId);
        
        if (fullCustomerData) {
          onSelect(fullCustomerData);
        } else {
          // Fallback to the minimal data if fetch fails
          onSelect(selectedCustomer);
        }
      } catch (error) {
        console.error("Error fetching complete customer data:", error);
        // Still allow selection with minimal data
        onSelect(selectedCustomer);
      } finally {
        setLoading(false);
      }
    }
  };

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

      const newCustomerWithAllFields = {
        ...customerData,
        type: customerData.type || 'RETAIL',
        address: customerData.address || constructAddress(customerData),
      };
      
      setCustomers(prev => [newCustomerWithAllFields, ...prev]);
      setSelectedId(newCustomerId);
      setShowNewCustomerDialog(false);
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      });
      
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

  return (
    <div className="max-h-[60vh] flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
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
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 max-h-[40vh]">
          {customers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No customers found.
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`
                    p-3 rounded-md cursor-pointer border
                    ${selectedId === customer.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'}
                    ${getPopularityScore(customer.name) > 0 ? 'border-yellow-300' : ''}
                  `}
                  onClick={() => setSelectedId(customer.id)}
                >
                  <div className="font-medium">
                    {customer.name || "Unnamed Customer"}
                    {getPopularityScore(customer.name) > 0 && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  {customer.address && (
                    <div className="text-sm text-muted-foreground">{customer.address}</div>
                  )}
                  {customer.phone && (
                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Add pagination controls */}
      {totalPages > 1 && !search && (
        <div className="mt-2 mb-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                
                // Logic to show pages around current page
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      isActive={pageNumber === currentPage}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 mt-auto pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={!selectedId}>
          Confirm Selection
        </Button>
      </div>

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
