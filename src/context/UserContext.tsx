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
  signIn: (email: string, password: string, keepSignedIn?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

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

const roleHierarchy: Record<UserRole, number> = {
  superadmin: 7,
  admin: 6,
  manager: 5,
  warehouse: 4,
  driver: 3,
  client: 2,
  customer: 1,
};

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

  const clearAuthState = () => {
    try {
      localStorage.removeItem('woodbourne-auth-token');
      console.log("Cleared specific auth token only");
    } catch (error) {
      console.error("Error clearing auth state:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event, !!session);
            
            if (event === 'SIGNED_IN' && session) {
              try {
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
                  avatar: null,
                  created_at: session.user.created_at,
                  last_sign_in: session.user.last_sign_in_at,
                });
              } catch (error) {
                console.error("Error fetching profile after sign in:", error);
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || 'User',
                  role: 'customer',
                  avatar: null,
                  created_at: session.user.created_at,
                  last_sign_in: session.user.last_sign_in_at,
                });
              }
            }
            
            if (event === 'SIGNED_OUT') {
              setUser(null);
              if (location.pathname !== '/auth') {
                navigate('/auth');
              }
            }
          }
        );
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (userError && userError.code !== 'PGRST116') {
              console.error("Error fetching user profile:", userError);
            }
            
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: userData ? `${userData.first_name} ${userData.last_name}`.trim() : (session.user.user_metadata?.name || 'User'),
              role: userData ? mapDatabaseRole(userData.role) : 'customer',
              avatar: null,
              created_at: session.user.created_at,
              last_sign_in: session.user.last_sign_in_at,
            });
          } catch (profileError) {
            console.error("Error in profile processing:", profileError);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: 'customer',
              avatar: null,
              created_at: session.user.created_at,
              last_sign_in: session.user.last_sign_in_at,
            });
          }
        } else {
          setUser(null);
          
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
  }, [location.pathname, navigate, toast]);

  useEffect(() => {
    const checkRoleRestrictions = async () => {
      if (!user || isLoading) return;
      
      const currentPath = location.pathname;
      
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

  const signIn = async (email: string, password: string, keepSignedIn: boolean = true) => {
    try {
      const expirySeconds = keepSignedIn ? 30 * 24 * 60 * 60 : 8 * 60 * 60;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        
        let errorMessage = error.message;
        
        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      try {
        localStorage.setItem('woodbourne-keep-signed-in', keepSignedIn ? 'true' : 'false');
      } catch (e) {
        console.warn("Could not save session preference", e);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      
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
      
      try {
        localStorage.removeItem('woodbourne-keep-signed-in');
      } catch (e) {
        console.warn("Could not clear session preference", e);
      }
      
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
          avatar: null,
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
