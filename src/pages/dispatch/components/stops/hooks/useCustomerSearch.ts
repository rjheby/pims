
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "../types";
import { toast } from "@/components/ui/use-toast";
import { constructAddress, sortCustomersByPopularity } from "../CustomerUtils";

export function useCustomerSearch(itemsPerPage = 10) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

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
  }, [itemsPerPage]);

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

  const createCustomer = async (newCustomer: Omit<Customer, 'id'>) => {
    if (!newCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return null;
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
        return null;
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
        return null;
      }

      const newCustomerWithAllFields = {
        ...customerData,
        type: customerData.type || 'RETAIL',
        address: customerData.address || constructAddress(customerData),
      };
      
      setCustomers(prev => [newCustomerWithAllFields, ...prev]);
      
      toast({
        title: "Success",
        description: "Customer created successfully"
      });
      
      return newCustomerWithAllFields;
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    customers,
    loading,
    currentPage,
    totalPages,
    totalCustomers,
    fetchCustomersMinimal,
    fetchCustomerDetails,
    searchCustomers,
    createCustomer,
    setCurrentPage
  };
}
