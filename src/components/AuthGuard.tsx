
import { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { UserRole } from "@/types/user";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading, hasPermission } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/auth', { state: { from: location.pathname } });
      } else if (requiredRole && !hasPermission(requiredRole)) {
        // Redirect to home if user doesn't have required permissions
        navigate('/', { 
          state: { 
            permissionDenied: true, 
            requiredRole 
          } 
        });
      }
    }
  }, [user, isLoading, requiredRole, hasPermission, navigate, location.pathname]);

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

  // This will likely never render as the redirects should happen in the useEffect
  return null;
}
