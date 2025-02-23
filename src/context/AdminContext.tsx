
import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "./UserContext";

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
      if (isAdmin && hasUnsavedChanges) {
        const message = options?.confirmMessage || 'You have unsaved changes. Do you want to save them before exiting admin mode?';
        if (window.confirm(message)) {
          options?.onSave?.();
          exitAdminMode();
        } else {
          options?.onDiscard?.();
          exitAdminMode();
        }
      } else {
        isAdmin ? exitAdminMode() : enterAdminMode();
      }
    },
    [isAdmin, hasUnsavedChanges, exitAdminMode, enterAdminMode]
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
