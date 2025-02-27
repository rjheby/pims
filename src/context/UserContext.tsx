
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role, Permission } from "@/types/user";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    permissions: ["read", "write", "delete", "superadmin"],
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    permissions: ["read"],
  },
];

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading the user from local storage or a token
    const loadUser = async () => {
      try {
        // For demo purposes, auto-login as admin
        setUser(mockUsers[0]);
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user by email (in a real app, this would be an API call)
      const foundUser = mockUsers.find((u) => u.email === email);
      
      if (foundUser) {
        setUser(foundUser);
        // Here you would store a token in localStorage
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    // Here you would remove the token from localStorage
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        hasPermission,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
