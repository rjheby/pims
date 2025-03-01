
import { createContext, useContext, ReactNode } from "react";
import { UserRole, LegacyUserRole, mapLegacyRole } from "@/types/user";
import { useAuth } from "./AuthContext";

// For compatibility with existing code using UserContext
interface UserContextType {
  user: {
    id: string;
    name: string;
    email: string;
    role: LegacyUserRole;
  } | null;
  setUser: (user: any) => void;
  hasPermission: (requiredRole: LegacyUserRole) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // Use the new AuthContext under the hood
  const { currentUser, hasPermission: newHasPermission, logout } = useAuth();
  
  // Legacy role hierarchy for backward compatibility
  const roleHierarchy: Record<LegacyUserRole, number> = {
    superadmin: 4,
    admin: 3,
    staff: 2,
    client: 1,
    customer: 0,
  };

  // Map new User to old user format
  const legacyUser = currentUser ? {
    id: currentUser.id,
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    email: currentUser.email || "",
    role: getLegacyRole(currentUser.role)
  } : null;

  // Convert new role to legacy role
  function getLegacyRole(role: UserRole): LegacyUserRole {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "superadmin";
      case UserRole.ADMIN:
        return "admin";
      case UserRole.MANAGER:
        return "staff";
      case UserRole.DRIVER:
      case UserRole.CLIENT:
        return "client";
      default:
        return "customer";
    }
  }

  // Legacy hasPermission for backward compatibility
  const hasPermission = (requiredRole: LegacyUserRole) => {
    if (!legacyUser) return false;
    return roleHierarchy[legacyUser.role] >= roleHierarchy[requiredRole];
  };

  // This function is now just a wrapper around logout
  const setUser = (user: any) => {
    if (user === null) {
      logout();
    }
    // Ignore other cases as we're using AuthContext now
  };

  return (
    <UserContext.Provider value={{ user: legacyUser, setUser, hasPermission }}>
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
