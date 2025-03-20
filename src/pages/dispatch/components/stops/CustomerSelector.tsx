
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, UserPlus } from "lucide-react";
import { Customer } from "./types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useCustomerData } from "@/hooks/useCustomerData";

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
  const { 
    customers, 
    loading, 
    error, 
    hasMore, 
    searchTerm, 
    setSearchTerm, 
    fetchMoreCustomers,
    addCustomerToCache
  } = useCustomerData();
  
  const [selectedId, setSelectedId] = useState<string | null>(initialCustomerId || null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    type: 'RETAIL',
    address: '',
    phone: '',
    email: ''
  });
  
  // Intersection observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCustomerElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMoreCustomers();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchMoreCustomers]);

  // Select the initial customer if provided
  useEffect(() => {
    if (initialCustomerId) {
      setSelectedId(initialCustomerId);
    }
  }, [initialCustomerId]);

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

      // Process the new customer data
      const constructAddress = (customer: any) => {
        const parts = [
          customer.street_address,
          customer.city,
          customer.state,
          customer.zip_code
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join(', ') : '';
      };

      const newCustomerWithAllFields = {
        ...customerData,
        type: customerData.type || 'RETAIL',
        address: customerData.address || constructAddress(customerData),
      };
      
      // Add to cache and set as selected
      addCustomerToCache(newCustomerWithAllFields);
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

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading customers: {error}
        <div className="mt-4">
          <Button onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="relative flex-1 mr-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        {customers.length === 0 && !loading ? (
          <div className="text-center py-6 text-muted-foreground">
            No customers found.
          </div>
        ) : (
          <div className="space-y-2">
            {customers.map((customer, index) => {
              // Add a ref to the last element for infinite scrolling
              const isLastElement = index === customers.length - 1;
              
              return (
                <div
                  key={customer.id}
                  ref={isLastElement ? lastCustomerElementRef : null}
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
              );
            })}
            
            {loading && (
              <div className="py-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
      
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
