
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Customer } from './types';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void;
  onCancel: () => void;
  initialCustomerId?: string | null;
}

export function CustomerSelector({ onSelect, onCancel, initialCustomerId }: CustomerSelectorProps) {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers from Supabase
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        
        // Fetch all customers
        const { data: allCustomers, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('name');
          
        if (customersError) throw customersError;
        
        // Fetch recent customers (most recently created/updated)
        const { data: topCustomers, error: recentCustomersError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (recentCustomersError) throw recentCustomersError;
        
        if (allCustomers) {
          setCustomers(allCustomers);
          
          // If there's an initial customer ID, select that customer
          if (initialCustomerId) {
            const initialCustomer = allCustomers.find(c => c.id === initialCustomerId);
            if (initialCustomer) {
              setFilteredCustomers([initialCustomer]);
            }
          }
        }
        
        if (topCustomers) {
          setRecentCustomers(topCustomers);
        }
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomers();
  }, [initialCustomerId]);

  // Filter customers based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  if (loading) {
    return <div className="p-4 text-center">Loading customers...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Select Customer</DialogTitle>
        <DialogDescription>
          Choose a customer from the list or search by name, address, or phone
        </DialogDescription>
      </DialogHeader>
      
      {/* Search input */}
      <div>
        <label className="block text-sm font-medium mb-1">Search Customers</label>
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search customers..."
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {/* Recent customers */}
      {recentCustomers.length > 0 && searchTerm.length === 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Customers</h3>
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <ul className="divide-y">
              {recentCustomers.map((customer) => (
                <li 
                  key={customer.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col"
                  onClick={() => onSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.address}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Search results */}
      {filteredCustomers.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'Result' : 'Results'}
          </label>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            <ul className="divide-y">
              {filteredCustomers.map((customer) => (
                <li 
                  key={customer.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col"
                  onClick={() => onSelect(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.address}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
      </div>
    </div>
  );
}
