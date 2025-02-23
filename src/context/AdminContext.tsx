
import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "./UserContext";

interface AdminContextType {
  isAdmin: boolean;
  hasUnsavedChanges: boolean;
  enterAdminMode: () => void;
  exitAdminMode: () => void;
  setHasUnsavedChanges: (value: boolean) => void;
  handleAdminToggle: (onSave?: () => void, onDiscard?: () => void) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { hasPermission } = useUser();
  const { toast } = useToast();

  const enterAdminMode = () => {
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
  };

  const exitAdminMode = () => {
    setIsAdmin(false);
    setHasUnsavedChanges(false);
    toast({
      title: "Admin Mode",
      description: "You have exited admin mode.",
    });
  };

  const handleAdminToggle = (onSave?: () => void, onDiscard?: () => void) => {
    if (isAdmin && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save them before exiting admin mode?')) {
        onSave?.();
        exitAdminMode();
      } else {
        onDiscard?.();
        exitAdminMode();
      }
    } else {
      isAdmin ? exitAdminMode() : enterAdminMode();
    }
  };

  return (
    <AdminContext.Provider 
      value={{ 
        isAdmin, 
        hasUnsavedChanges, 
        enterAdminMode, 
        exitAdminMode, 
        setHasUnsavedChanges,
        handleAdminToggle 
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
