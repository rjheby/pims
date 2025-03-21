
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CustomerCard } from "./CustomerCard";
import { PaginationControls } from "./PaginationControls";
import { NewCustomerForm } from "./NewCustomerForm";
import { CustomerSearch } from "./CustomerSearch";
import { useCustomerSearch } from "./hooks/useCustomerSearch";

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
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialCustomerId || null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  
  const {
    customers,
    loading,
    currentPage,
    totalPages,
    fetchCustomersMinimal,
    fetchCustomerDetails,
    searchCustomers,
    createCustomer,
    setCurrentPage
  } = useCustomerSearch(10);

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

  const handleConfirm = async () => {
    if (!selectedId) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedId);
    
    if (selectedCustomer) {
      // Use existing loading state from the hook
      try {
        const fullCustomerData = await fetchCustomerDetails(selectedId);
        
        if (fullCustomerData) {
          onSelect(fullCustomerData);
        } else {
          onSelect(selectedCustomer);
        }
      } catch (error) {
        onSelect(selectedCustomer);
      }
    }
  };

  const handleCreateCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    const createdCustomer = await createCustomer(newCustomer);
    
    if (createdCustomer) {
      setSelectedId(createdCustomer.id);
      setShowNewCustomerDialog(false);
      onSelect(createdCustomer);
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
