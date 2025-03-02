
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Permissions } from "@/types/permissions";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Development bypass flag - REMOVE BEFORE PRODUCTION
// You can toggle this constant to enable/disable auth bypass during development
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

  // Log authentication status for debugging
  console.log('Auth status:', { 
    currentUser: currentUser?.email || 'none', 
    isLoading, 
    isDevelopment, 
    bypassAuth,
    requireAdmin,
    requiredPermission
  });

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
    console.log('Auth loading, showing spinner');
    // Show loading spinner while checking authentication
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#2A4131]"></div>
        </div>
      </SidebarProvider>
    );
  }

  // Not logged in and not bypassing auth
  if (!currentUser && !bypassAuth) {
    console.log('Not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required and not bypassing
  if (requireAdmin && !isAdminOrAbove() && !bypassAuth) {
    console.log('Insufficient admin privileges - redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific permission if required and not bypassing
  if (requiredPermission && !hasPermission(requiredPermission) && !bypassAuth) {
    console.log(`Missing required permission: ${requiredPermission} - redirecting to unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  // If bypassing auth with no user, log this information
  if (bypassAuth && !currentUser) {
    console.log('DEV MODE: Authentication bypassed - would normally require login');
  }

  console.log('Access granted to protected route');
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
