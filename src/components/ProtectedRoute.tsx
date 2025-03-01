
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Permissions } from "@/types/permissions";

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

  if (isLoading) {
    // Show loading spinner while checking authentication
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#2A4131]"></div>
    </div>;
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (requireAdmin && !isAdminOrAbove()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Special component for Admin-only routes
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute requiredPermission={Permissions.ADMIN_ACCESS} requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
};
