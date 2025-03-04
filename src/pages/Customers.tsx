
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { useCustomers } from "./customers/hooks/useCustomers";
import { CustomerSection } from "./customers/CustomerSection";
import { CustomerEditDialog } from "./customers/components/CustomerEditDialog";
import { Customer } from "./customers/types";

export default function Customers() {
  const { 
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

  const handleAddCustomer = (customerData: Partial<Customer>) => {
    addCustomer(customerData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>);
    setAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Customer Database</h1>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full md:w-[250px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              <CustomerSection
                title="Commercial Customers"
                customers={commercialCustomers}
                onAddCustomer={(customerData) => addCustomer({...customerData, type: 'commercial'} as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)}
                onUpdateCustomer={updateCustomer}
                onDeleteCustomer={deleteCustomer}
              />
              
              <CustomerSection
                title="Residential Customers"
                customers={residentialCustomers}
                onAddCustomer={(customerData) => addCustomer({...customerData, type: 'residential'} as Omit<Customer, 'id' | 'created_at' | 'updated_at'>)}
                onUpdateCustomer={updateCustomer}
                onDeleteCustomer={deleteCustomer}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <CustomerEditDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAddCustomer}
      />
    </div>
  );
}
