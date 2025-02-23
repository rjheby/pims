
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ 
  children,
  isAdminMode = false,
}: { 
  children: React.ReactNode;
  isAdminMode?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Admin Mode Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-red-500 bg-opacity-10 transition-opacity duration-500 pointer-events-none",
          isAdminMode ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Animated Admin Mode Indicator */}
      {isAdminMode && (
        <div className="fixed top-2 right-4 z-50 animate-pulse text-sm px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg">
          Admin Mode Active
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className={cn(
        "relative flex w-full transition-colors duration-300",
        isAdminMode ? "bg-[#FEE2E2]/20" : "bg-[#F2E9D2]/10"
      )}>
        <AppSidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className={cn(
          "flex-1 transition-all duration-300",
          "px-4 md:px-6 pb-20 md:pb-8",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}>
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
