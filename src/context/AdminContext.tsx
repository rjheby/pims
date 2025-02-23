
import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface AdminContextType {
  isAdmin: boolean;
  hasUnsavedChanges: boolean;
  setIsAdmin: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  saveChanges: () => void;
  discardChanges: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const saveChanges = () => {
    setHasUnsavedChanges(false);
    setIsAdmin(false);
    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const discardChanges = () => {
    setHasUnsavedChanges(false);
    setIsAdmin(false);
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
    });
  };

  return (
    <AdminContext.Provider 
      value={{ 
        isAdmin, 
        hasUnsavedChanges, 
        setIsAdmin, 
        setHasUnsavedChanges,
        saveChanges,
        discardChanges
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
