
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading, hasPermission } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Don't redirect if still loading - prevents flashing
    if (isLoading) return;
    
    // Don't do anything if we're already on the auth page
    if (location.pathname === '/auth') return;
    
    if (!user) {
      // Show a toast notification about the redirect
      toast({
        title: "Authentication required",
        description: "Please sign in to continue",
      });
      
      // Redirect to login if not authenticated, preserving current location
      navigate('/auth', { 
        state: { from: location.pathname },
        replace: true  // Use replace to avoid building up history stack
      });
    } else if (requiredRole && !hasPermission(requiredRole)) {
      // Redirect to home if user doesn't have required permissions
      toast({
        title: "Permission denied",
        description: `You need ${requiredRole} permissions to access this page`,
        variant: "destructive",
      });
      
      navigate('/', { 
        state: { 
          permissionDenied: true, 
          requiredRole 
        },
        replace: true
      });
    }
  }, [user, isLoading, requiredRole, hasPermission, navigate, location.pathname, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render children only if user is authenticated and has required role (or no role is required)
  if (user && (!requiredRole || hasPermission(requiredRole))) {
    return <>{children}</>;
  }

  // Show loading state instead of returning null to prevent flashing
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
