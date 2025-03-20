
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { queryCache } from "@/utils/queryCache";
import { toast } from "@/components/ui/use-toast";

export type Customer = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  type: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
};

const CACHE_KEY = 'customers';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes
const PAGE_SIZE = 30;

export function useCustomerData() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Address construction utility
  const constructAddress = useCallback((customer: any) => {
    const parts = [
      customer.street_address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : '';
  }, []);
  
  // Process raw customer data to add formatted address
  const processCustomers = useCallback((data: any[]) => {
    return data.map(customer => ({
      ...customer,
      type: customer.type || 'RETAIL',
      address: customer.address || constructAddress(customer),
    }));
  }, [constructAddress]);

  // Initial fetch with cache check
  const fetchInitialCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedData = queryCache.get<Customer[]>(CACHE_KEY);
      if (cachedData) {
        console.log("Using cached customer data");
        setCustomers(cachedData);
        setLoading(false);
        return;
      }
      
      console.log("Fetching initial customers data");
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .order('name')
        .range(0, PAGE_SIZE - 1);
        
      if (error) {
        console.error("Error fetching customers:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to fetch customers: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      const processedData = processCustomers(data || []);
      setCustomers(processedData);
      setHasMore(data && data.length === PAGE_SIZE);
      
      // Cache the processed data
      queryCache.set(CACHE_KEY, processedData, CACHE_EXPIRY);
      
    } catch (error: any) {
      console.error("Error in fetchInitialCustomers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [processCustomers]);

  // Load more data when scrolling
  const fetchMoreCustomers = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      
      const start = page * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;
      
      console.log(`Fetching more customers from ${start} to ${end}`);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .order('name')
        .range(start, end);
        
      if (error) {
        console.error("Error fetching more customers:", error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const processedData = processCustomers(data);
        
        setCustomers(prev => {
          const newData = [...prev, ...processedData];
          // Update the cache with the combined data
          queryCache.set(CACHE_KEY, newData, CACHE_EXPIRY);
          return newData;
        });
        
        setHasMore(data.length === PAGE_SIZE);
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
      }
      
    } catch (error: any) {
      console.error("Error in fetchMoreCustomers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, processCustomers]);

  // Search functionality
  const searchCustomers = useCallback(async (term: string) => {
    if (!term.trim()) {
      // If search is cleared, revert to cached data or initial fetch
      const cachedData = queryCache.get<Customer[]>(CACHE_KEY);
      if (cachedData) {
        setCustomers(cachedData);
      } else {
        fetchInitialCustomers();
      }
      return;
    }
    
    try {
      setLoading(true);
      
      const searchCache = queryCache.get<Customer[]>(`${CACHE_KEY}_search_${term}`);
      if (searchCache) {
        setCustomers(searchCache);
        setLoading(false);
        return;
      }
      
      console.log("Searching customers:", term);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, address, phone, email, notes, type, street_address, city, state, zip_code')
        .or(`name.ilike.%${term}%,address.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`)
        .order('name');
        
      if (error) {
        console.error("Error searching customers:", error);
        setError(error.message);
        return;
      }

      const processedData = processCustomers(data || []);
      setCustomers(processedData);
      
      // Cache the search results
      queryCache.set(`${CACHE_KEY}_search_${term}`, processedData, CACHE_EXPIRY);
      
    } catch (error: any) {
      console.error("Error in searchCustomers:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchInitialCustomers, processCustomers]);

  // Initialize data
  useEffect(() => {
    fetchInitialCustomers();
  }, [fetchInitialCustomers]);

  // Handle search term changes
  useEffect(() => {
    const handler = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm, searchCustomers]);

  return {
    customers,
    loading,
    error,
    hasMore,
    searchTerm,
    setSearchTerm,
    fetchMoreCustomers,
    refreshCustomers: fetchInitialCustomers,
    addCustomerToCache: (customer: Customer) => {
      setCustomers(prev => {
        const newData = [customer, ...prev];
        queryCache.set(CACHE_KEY, newData, CACHE_EXPIRY);
        return newData;
      });
    }
  };
}
