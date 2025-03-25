
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has admin privileges
 * @returns {Promise<boolean>} True if the user is an admin, false otherwise
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    // Query the profiles table to check if the user has admin role
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (error || !data) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return data.role === 'ADMIN' || data.role === 'SUPER_ADMIN';
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
