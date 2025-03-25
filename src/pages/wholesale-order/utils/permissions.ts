
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to check if the current user has admin privileges
 * @returns Promise<boolean> indicating whether the current user is an admin
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    // First check local storage for previously cached admin status
    const cachedAdminStatus = localStorage.getItem('isAdmin');
    if (cachedAdminStatus) {
      return cachedAdminStatus === 'true';
    }
    
    // If no cached status, check with Supabase
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    // Cache the result for future checks
    localStorage.setItem('isAdmin', data ? 'true' : 'false');
    
    return !!data;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
};
