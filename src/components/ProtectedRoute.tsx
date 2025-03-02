
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Permissions } from "@/types/permissions";

// Development bypass flag - REMOVE BEFORE PRODUCTION
const BYPASS_AUTH = true; // Set to false to disable bypass

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredPermission,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { currentUser, isLoading, hasPermission, isAdminOrAbove } = useAuth();
  const location = useLocation();
  const isDevelopment = import.meta.env.DEV; // Vite's way to detect development mode
  const bypassAuth = BYPASS_AUTH && isDevelopment;

  // Show bypass indicator if active
  const AuthBypassIndicator = () => {
    if (bypassAuth) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-1 text-xs text-center z-50">
          🔓 AUTH BYPASSED - DEVELOPMENT MODE 🔓
        </div>
      );
    }
    return null;
  };

  if (isLoading && !bypassAuth) {
    // Show loading spinner while checking authentication
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#2A4131]"></div>
    </div>;
  }

  // Not logged in and not bypassing auth
  if (!currentUser && !bypassAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required and not bypassing
  if (requireAdmin && !isAdminOrAbove() && !bypassAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific permission if required and not bypassing
  if (requiredPermission && !hasPermission(requiredPermission) && !bypassAuth) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <AuthBypassIndicator />
      {children}
    </>
  );
};

// Special component for Admin-only routes
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredPermission={Permissions.ADMIN_ACCESS} requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};
