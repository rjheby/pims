
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Permissions, rolePermissions } from '@/types/permissions';

// This context is for backward compatibility
interface UserContextType {
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  user: {
    name?: string;
    role?: string;
  } | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  // Map old permission strings to new permissions system
  const hasPermission = (permission: string) => {
    if (!auth || !auth.currentUser) return false;
    
    // Map legacy permissions to new system
    const permissionMap: Record<string, string> = {
      'admin': Permissions.ADMIN_ACCESS,
      'view_orders': Permissions.VIEW_ALL_PAGES,
      'edit_orders': Permissions.EDIT_DATA,
      'create_orders': Permissions.SUBMIT_ORDERS,
      'driver': Permissions.ACCESS_DISPATCH,
      'superadmin': Permissions.ADMIN_ACCESS, // Added for superadmin check
    };
    
    const mappedPermission = permissionMap[permission] || permission;
    return auth.hasPermission(mappedPermission);
  };
  
  const isAdmin = () => {
    return auth.isAdminOrAbove();
  };
  
  const isSuperAdmin = () => {
    return auth.isSuperAdmin();
  };

  // Add user object
  const user = auth.currentUser ? {
    name: `${auth.currentUser.firstName} ${auth.currentUser.lastName}`.trim(),
    role: auth.currentUser.role
  } : null;

  return (
    <UserContext.Provider value={{ hasPermission, isAdmin, isSuperAdmin, user }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // If we're not in a UserProvider, try to use the global state set by AuthContext
    if (window.currentAuthUser) {
      return {
        hasPermission: (permission: string) => {
          // Map old permissions to new permissions system
          const permissionMap: Record<string, string> = {
            'admin': Permissions.ADMIN_ACCESS,
            'view_orders': Permissions.VIEW_ALL_PAGES,
            'edit_orders': Permissions.EDIT_DATA,
            'create_orders': Permissions.SUBMIT_ORDERS,
            'driver': Permissions.ACCESS_DISPATCH,
            'superadmin': Permissions.ADMIN_ACCESS, // Added for superadmin check
          };
          
          const mappedPermission = permissionMap[permission] || permission;
          const role = window.currentAuthUser.role;
          const permissions = rolePermissions[role];
          return permissions?.includes(mappedPermission) || false;
        },
        isAdmin: () => {
          const role = window.currentAuthUser.role;
          return role === 'ADMIN' || role === 'SUPER_ADMIN';
        },
        isSuperAdmin: () => {
          return window.currentAuthUser.role === 'SUPER_ADMIN';
        },
        user: {
          name: `${window.currentAuthUser.firstName || ''} ${window.currentAuthUser.lastName || ''}`.trim(),
          role: window.currentAuthUser.role
        }
      };
    }
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Add to window for global access
declare global {
  interface Window {
    currentAuthUser: any;
  }
}

// Initialize global user
window.currentAuthUser = null;
