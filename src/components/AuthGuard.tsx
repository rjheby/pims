
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
}

// Temporarily disabled authentication - showing all content
export function AuthGuard({ children }: AuthGuardProps) {
  return <>{children}</>;
}
