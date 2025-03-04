
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "../types";
import { toast } from "@/components/ui/use-toast";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching customers...");
      
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order('name');

      if (error) {
        console.error("Error fetching customers:", error);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Customers data received:", data);
      setCustomers(data as Customer[] || []);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Something went wrong while loading customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .insert(customer)
        .select();

      if (error) {
        console.error("Error adding customer:", error);
        toast({
          title: "Error",
          description: "Failed to add customer",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      
      // Refresh the customer list
      fetchCustomers();
      
      return { success: true, data };
    } catch (err) {
      console.error("Error in addCustomer:", err);
      toast({
        title: "Error",
        description: "Something went wrong while adding customer",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  }, [fetchCustomers]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error("Error updating customer:", error);
        toast({
          title: "Error",
          description: "Failed to update customer",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      
      // Refresh the customer list
      fetchCustomers();
      
      return { success: true };
    } catch (err) {
      console.error("Error in updateCustomer:", err);
      toast({
        title: "Error",
        description: "Something went wrong while updating customer",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  }, [fetchCustomers]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting customer:", error);
        toast({
          title: "Error",
          description: "Failed to delete customer",
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      
      // Refresh the customer list
      fetchCustomers();
      
      return { success: true };
    } catch (err) {
      console.error("Error in deleteCustomer:", err);
      toast({
        title: "Error",
        description: "Something went wrong while deleting customer",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  }, [fetchCustomers]);

  const filteredCustomers = useCallback((type?: 'commercial' | 'residential') => {
    let filtered = customers;
    
    // Filter by type if specified
    if (type) {
      filtered = filtered.filter(customer => customer.type === type);
    }
    
    // Filter by search term if available
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        (customer.email && customer.email.toLowerCase().includes(term)) ||
        (customer.phone && customer.phone.toLowerCase().includes(term)) ||
        (customer.address && customer.address.toLowerCase().includes(term)) ||
        (customer.notes && customer.notes.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [customers, searchTerm]);

  // Initialize data fetching
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    commercialCustomers: filteredCustomers('commercial'),
    residentialCustomers: filteredCustomers('residential'),
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchTerm,
    setSearchTerm
  };
}
