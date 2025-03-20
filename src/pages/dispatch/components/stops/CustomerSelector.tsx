
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .order('name');
        
      if (error) {
        throw error;
      }

      // Ensure all customers have the expected fields according to the schema
      const processedCustomers = data.map((customer) => ({
        ...customer,
        // Ensure type is set (defaults to RETAIL if missing)
        type: customer.type || 'RETAIL',
        // Make sure address is available even if it's constructed from components
        address: customer.address || constructAddress(customer),
      }));
      
      setCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to construct address from components if needed
  const constructAddress = (customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const filteredCustomers = customers.filter(customer => 
    (customer.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (customer.address || "").toLowerCase().includes(search.toLowerCase()) ||
    (customer.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!selectedId) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedId);
    if (selectedCustomer) {
      onSelect(selectedCustomer);
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
      
      setCustomers(prev => [...prev, newCustomerWithAllFields]);
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

  return (
    <div className="max-h-[60vh] flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No customers found.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`
                    p-3 rounded-md cursor-pointer border
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
          )}
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
