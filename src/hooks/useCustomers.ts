
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  street_address: string;
  unit_number?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  delivery_zone?: string;
  delivery_notes?: string;
  customer_type?: string;
  is_active?: boolean;
  has_stairs?: boolean;
  latitude?: number;
  longitude?: number;
  arrival_window?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
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
  }, [toast]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding customer:", customer);
      
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
  }, [fetchCustomers, toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    fetchCustomers,
    addCustomer
  };
}
