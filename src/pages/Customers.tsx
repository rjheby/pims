
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, Filter } from "lucide-react";
import { useCustomers } from "./customers/hooks/useCustomers";
import { CustomerSection } from "./customers/CustomerSection";
import { CustomerEditDialog } from "./customers/components/CustomerEditDialog";
import { Customer } from "./customers/types";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

export default function Customers() {
  const { 
    customers,
    commercialCustomers, 
    residentialCustomers, 
    loading, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer,
    searchTerm,
    setSearchTerm
  } = useCustomers();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>(undefined);
  const [filterActive, setFilterActive] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Handle the edit query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    
    if (editId && customers.length > 0) {
      const customerToEdit = customers.find(c => c.id === editId);
      if (customerToEdit) {
        setEditCustomer(customerToEdit);
      }
    }
  }, [location.search, customers]);

  const handleAddCustomer = (customerData: Partial<Customer>) => {
    addCustomer(customerData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>);
    setAddDialogOpen(false);
  };

  const handleUpdateCustomer = (customerData: Partial<Customer>) => {
    if (editCustomer) {
      updateCustomer(editCustomer.id, customerData);
      setEditCustomer(undefined);
      
      // Clear the edit parameter from URL after editing
      navigate('/customers');
    }
  };

  const handleCloseEditDialog = () => {
    setEditCustomer(undefined);
    
    // Clear the edit parameter from URL when closing the dialog
    navigate('/customers');
  };

  const toggleFilter = (type: string) => {
    if (filterType === type) {
      setFilterType("all");
      setFilterActive(false);
    } else {
      setFilterType(type);
      setFilterActive(true);
    }
  };

  // Filter customers based on search and type
  const filteredCommercialCustomers = filterType === "all" || filterType === "commercial" 
    ? commercialCustomers 
    : [];
  
  const filteredResidentialCustomers = filterType === "all" || filterType === "residential" 
    ? residentialCustomers 
    : [];

  const totalFilteredCustomers = filteredCommercialCustomers.length + filteredResidentialCustomers.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl">Customer Database</CardTitle>
              <CardDescription className="mt-1 text-sm">
                Manage your commercial and residential customers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Search and Filters Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filterActive && filterType === "commercial" ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter("commercial")}
              >
                Commercial
                {filterActive && filterType === "commercial" && (
                  <Badge className="ml-2 bg-primary-foreground text-primary">
                    {filteredCommercialCustomers.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant={filterActive && filterType === "residential" ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter("residential")}
              >
                Residential
                {filterActive && filterType === "residential" && (
                  <Badge className="ml-2 bg-primary-foreground text-primary">
                    {filteredResidentialCustomers.length}
                  </Badge>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </div>
          </div>
          
          {/* Filter info and counts */}
          {(filterActive || searchTerm) && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {totalFilteredCustomers} of {customers.length} customers
              {searchTerm && <span> (search: "{searchTerm}")</span>}
              {filterActive && <span> (filter: {filterType})</span>}
            </div>
          )}
          
          {/* Main Content */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCommercialCustomers.length > 0 && (
                <CustomerSection
                  title="Commercial Customers"
                  customers={filteredCommercialCustomers}
                  onAddCustomer={(customerData) => addCustomer({...customerData, type: 'commercial'} as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)}
                  onUpdateCustomer={updateCustomer}
                  onDeleteCustomer={deleteCustomer}
                />
              )}
              
              {filteredResidentialCustomers.length > 0 && (
                <CustomerSection
                  title="Residential Customers"
                  customers={filteredResidentialCustomers}
                  onAddCustomer={(customerData) => addCustomer({...customerData, type: 'residential'} as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)}
                  onUpdateCustomer={updateCustomer}
                  onDeleteCustomer={deleteCustomer}
                />
              )}
              
              {totalFilteredCustomers === 0 && (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  No customers match your search criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      <CustomerEditDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddCustomer}
      />
      
      <CustomerEditDialog
        customer={editCustomer}
        isOpen={!!editCustomer}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateCustomer}
      />
      
      {/* Mobile action button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6">
          <Button size="lg" className="rounded-full w-12 h-12 p-0 shadow-lg" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
