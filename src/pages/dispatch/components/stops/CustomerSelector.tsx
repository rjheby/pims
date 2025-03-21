import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { CustomerCard } from "./CustomerCard";
import { PaginationControls } from "./PaginationControls";
import { NewCustomerForm } from "./NewCustomerForm";
import { CustomerSearch } from "./CustomerSearch";
import { constructAddress, getPopularityScore, sortCustomersByPopularity } from "./CustomerUtils";

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const itemsPerPage = 10;

  const fetchCustomersMinimal = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const { count, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
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
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, street_address, city, state, zip_code')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('name');
        
      if (error) {
        toast({
          title: "Error",
          description: `Failed to fetch customers: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      const processedCustomers = data.map((customer) => ({
        ...customer,
        type: 'RETAIL',
        address: customer.address || constructAddress(customer),
        phone: '',
        email: '',
        notes: ''
      }));
      
      const sortedCustomers = sortCustomersByPopularity(processedCustomers);
      
      setCustomers(sortedCustomers);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomerDetails = useCallback(async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .eq('id', customerId)
        .single();
        
      if (error) {
        return null;
      }
      
      return {
        ...data,
        type: data.type || 'RETAIL',
        address: data.address || constructAddress(data),
      };
      
    } catch (error) {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchCustomersMinimal(currentPage);
  }, [fetchCustomersMinimal, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
    
    if (searchValue.length > 0) {
      searchCustomers(searchValue);
    } else {
      setCurrentPage(1);
      fetchCustomersMinimal(1);
    }
  };
  
  const searchCustomers = async (searchTerm: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, street_address, city, state, zip_code')
        .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
        .order('name');
        
      if (error) {
        toast({
          title: "Error",
          description: `Failed to search customers: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      const processedCustomers = data.map((customer) => ({
        ...customer,
        type: 'RETAIL',
        address: customer.address || constructAddress(customer),
        phone: '',
        email: '',
        notes: ''
      }));
      
      const sortedCustomers = sortCustomersByPopularity(processedCustomers);
      
      setCustomers(sortedCustomers);
      setTotalPages(1);
    } catch (error: any) {
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
    
    const selectedCustomer = customers.find(c => c.id === selectedId);
    
    if (selectedCustomer) {
      setLoading(true);
      
      try {
        const fullCustomerData = await fetchCustomerDetails(selectedId);
        
        if (fullCustomerData) {
          onSelect(fullCustomerData);
        } else {
          onSelect(selectedCustomer);
        }
      } catch (error) {
        onSelect(selectedCustomer);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
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
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-h-[60vh] flex flex-col">
      <CustomerSearch 
        searchValue={search}
        onSearchChange={handleSearch}
        onAddNew={() => setShowNewCustomerDialog(true)}
        debounceTime={400}
      />
      
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
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  isSelected={selectedId === customer.id}
                  onClick={() => setSelectedId(customer.id)}
                  popularityScore={getPopularityScore(customer.name)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {totalPages > 1 && !search && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
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
          <NewCustomerForm 
            onCreateCustomer={handleCreateCustomer}
            onCancel={() => setShowNewCustomerDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
