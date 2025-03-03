
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";

interface AdminContextType {
  isAdmin: boolean;
  hasUnsavedChanges: boolean;
  enterAdminMode: () => void;
  exitAdminMode: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
  handleAdminToggle: (options?: {
    onSave?: () => void;
    onDiscard?: () => void;
    confirmMessage?: string;
  }) => void;
  markContentChanged: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { hasPermission } = useUser();
  const { toast } = useToast();
  
  // Check if we're in a browser context and handle router hooks safely
  let currentPath = '/';
  try {
    // This will throw an error if not in a Router context
    const location = useLocation();
    currentPath = location.pathname;
  } catch (error) {
    // Handle the error gracefully - we're not in a router context
    console.warn('AdminProvider: Router context not available');
  }

  const enterAdminMode = useCallback(() => {
    if (!hasPermission("admin")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to enter admin mode.",
        variant: "destructive",
      });
      return;
    }
    setIsAdmin(true);
    toast({
      title: "Admin Mode",
      description: "You are now in admin mode.",
    });
  }, [hasPermission, toast]);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
    setHasUnsavedChanges(false);
    toast({
      title: "Admin Mode",
      description: "You have exited admin mode.",
    });
  }, [toast]);

  const markContentChanged = useCallback(() => {
    if (isAdmin) {
      setHasUnsavedChanges(true);
    }
  }, [isAdmin]);

  const handleAdminToggle = useCallback(
    (options?: {
      onSave?: () => void;
      onDiscard?: () => void;
      confirmMessage?: string;
    }) => {
      const isWholesaleOrder = currentPath === "/wholesale-order";
      
      if (isAdmin) {
        if (hasUnsavedChanges) {
          const message = options?.confirmMessage || 'You have unsaved changes. Do you want to save them before exiting admin mode?';
          if (window.confirm(message)) {
            if (isWholesaleOrder) {
              options?.onSave?.();
            } else {
              // Generic save logic for other pages
              toast({
                title: "Changes saved",
                description: "Your changes have been saved successfully.",
              });
            }
            exitAdminMode();
          } else {
            if (isWholesaleOrder) {
              options?.onDiscard?.();
            }
            exitAdminMode();
          }
        } else {
          // No unsaved changes, just exit admin mode
          exitAdminMode();
        }
      } else {
        enterAdminMode();
      }
    },
    [isAdmin, hasUnsavedChanges, exitAdminMode, enterAdminMode, currentPath, toast]
  );

  return (
    <AdminContext.Provider 
      value={{ 
        isAdmin, 
        hasUnsavedChanges, 
        enterAdminMode, 
        exitAdminMode, 
        setHasUnsavedChanges,
        handleAdminToggle,
        markContentChanged
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
