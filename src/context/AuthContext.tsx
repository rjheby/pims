
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/user';
import { Permissions, rolePermissions } from '@/types/permissions';
import { useToast } from '@/hooks/use-toast';

// Define AuthContext types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  isAdminOrAbove: () => boolean;
  isSuperAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    const userPermissions = rolePermissions[currentUser.role];
    return userPermissions.includes(permission);
  };

  // Check if user is admin or above
  const isAdminOrAbove = (): boolean => {
    if (!currentUser) return false;
    return [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(currentUser.role);
  };

  // Check if user is super admin
  const isSuperAdmin = (): boolean => {
    if (!currentUser) return false;
    return currentUser.role === UserRole.SUPER_ADMIN;
  };

  // Get user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        email: session?.user?.email || '',
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        role: data.role as UserRole,
        isActive: data.is_active || false
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);

      if (data.session) {
        const userProfile = await fetchUserProfile(data.session.user.id);
        if (userProfile) {
          setCurrentUser(userProfile);
        }
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Unable to log in. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      
      // For testing, we're disabling email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      // For testing purposes, make the user automatically confirmed
      // In production, you would remove this and use proper email verification
      if (data.user) {
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully. You are now logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSession(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Unable to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription }} = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setIsLoading(true);

      if (session) {
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          setCurrentUser(userProfile);
        }
      } else {
        setCurrentUser(null);
      }

      setIsLoading(false);
    });

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setCurrentUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // For backward compatibility with UserContext
  useEffect(() => {
    // This makes the current auth state available to the legacy UserContext consumers
    window.currentAuthUser = currentUser;
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        hasPermission,
        isAdminOrAbove,
        isSuperAdmin,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
