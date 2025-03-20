
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (requiredRole: UserRole) => boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Map database roles to application roles
const mapDatabaseRole = (dbRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'SUPER_ADMIN': 'superadmin',
    'ADMIN': 'admin',
    'MANAGER': 'manager',
    'WAREHOUSE': 'warehouse',
    'DRIVER': 'driver',
    'CLIENT': 'client',
  };
  
  return (roleMap[dbRole] as UserRole) || dbRole as UserRole;
};

// Order matters! Higher number = more permissions
const roleHierarchy: Record<UserRole, number> = {
  superadmin: 7,
  admin: 6,
  manager: 5,
  warehouse: 4,
  driver: 3,
  client: 2,
  customer: 1,
};

// Define routes that require authentication
const protectedRoutes = [
  '/dispatch',
  '/dispatch-archive',
  '/inventory',
  '/customers',
  '/wholesale-order',
  '/client-order',
  '/team-settings',
  '/drivers',
];

// Define routes that require specific roles
const roleRestrictedRoutes: Record<string, UserRole> = {
  '/team-settings': 'admin',
  '/wholesale-order': 'manager',
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to selectively clear auth state - only used in extreme cases
  const clearAuthState = () => {
    try {
      // We'll only remove our specific token, not all Supabase tokens
      localStorage.removeItem('woodbourne-auth-token');
      
      // Don't clear other tokens unless we're sure we're in a bad state
      console.log("Cleared specific auth token only");
    } catch (error) {
      console.error("Error clearing auth state:", error);
    }
  };

  // Check auth status on initial load and route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Set up auth state change listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event, !!session);
            
            if (event === 'SIGNED_IN' && session) {
              try {
                // Get user profile after sign in
                const { data: userData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
                  
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: userData ? `${userData.first_name} ${userData.last_name}`.trim() : (session.user.user_metadata?.name || 'User'),
                  role: userData ? mapDatabaseRole(userData.role) : 'customer',
                  avatar: null, // profiles don't have avatar field, default to null
                  created_at: session.user.created_at,
                  last_sign_in: session.user.last_sign_in_at,
                });
              } catch (error) {
                console.error("Error fetching profile after sign in:", error);
                // Set basic user info without profile data
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || 'User',
                  role: 'customer', // Default role
                  avatar: null,
                  created_at: session.user.created_at,
                  last_sign_in: session.user.last_sign_in_at,
                });
              }
            }
            
            if (event === 'SIGNED_OUT') {
              setUser(null);
              // Only navigate if we're not already on the auth page
              if (location.pathname !== '/auth') {
                navigate('/auth');
              }
            }
          }
        );
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          try {
            // Get user profile data
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError && userError.code !== 'PGRST116') {
              console.error("Error fetching user profile:", userError);
            }
            
            // Set user with session and profile data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: userData ? `${userData.first_name} ${userData.last_name}`.trim() : (session.user.user_metadata?.name || 'User'),
              role: userData ? mapDatabaseRole(userData.role) : 'customer',
              avatar: null, // profiles don't have avatar field, default to null
              created_at: session.user.created_at,
              last_sign_in: session.user.last_sign_in_at,
            });
          } catch (profileError) {
            console.error("Error in profile processing:", profileError);
            // Continue with session data only
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: 'customer', // Default role
              avatar: null,
              created_at: session.user.created_at,
              last_sign_in: session.user.last_sign_in_at,
            });
          }
        } else {
          setUser(null);
          
          // Check if current route is protected and redirect to login if needed
          const currentPath = location.pathname;
          if (protectedRoutes.some(route => currentPath.startsWith(route)) && currentPath !== '/auth') {
            toast({
              title: "Authentication required",
              description: "Please sign in to access this page",
              variant: "destructive",
            });
            navigate('/auth', { state: { from: currentPath } });
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // No need to return cleanup function as the subscription is handled separately
  }, [location.pathname, navigate, toast]);

  // Check role restrictions for current route
  useEffect(() => {
    const checkRoleRestrictions = async () => {
      if (!user || isLoading) return;
      
      const currentPath = location.pathname;
      
      // Check if current route has role restrictions
      for (const [route, requiredRole] of Object.entries(roleRestrictedRoutes)) {
        if (currentPath.startsWith(route)) {
          if (!hasPermission(requiredRole)) {
            toast({
              title: "Access denied",
              description: `You need ${requiredRole} permissions to access this page`,
              variant: "destructive",
            });
            navigate('/');
            return;
          }
        }
      }
    };
    
    checkRoleRestrictions();
  }, [user, location.pathname, isLoading, navigate, toast]);

  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Try to sign in with the provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        
        // Handle specific errors without clearing all auth state
        let errorMessage = error.message;
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      // If we get here, sign in was successful
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Provide a generic error message for unexpected errors
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: userData ? `${userData.first_name} ${userData.last_name}`.trim() : (session.user.user_metadata?.name || 'User'),
          role: userData ? mapDatabaseRole(userData.role) : 'customer',
          avatar: null, // profiles don't have avatar field, default to null
          created_at: session.user.created_at,
          last_sign_in: session.user.last_sign_in_at,
        });
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      hasPermission, 
      isLoading,
      signIn,
      signOut,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
