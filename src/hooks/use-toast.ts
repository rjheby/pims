
// This file re-exports the toast hook from the UI library
import { toast } from "@/components/ui/toast";

// Define the type for the toast function
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

// Toast hook to provide toast functionality
export const useToast = () => {
  const showToast = ({ title, description, variant = "default", action }: ToastProps) => {
    toast({
      title,
      description,
      variant,
      action,
    });
  };

  return {
    toast: showToast,
  };
};

export { toast };
