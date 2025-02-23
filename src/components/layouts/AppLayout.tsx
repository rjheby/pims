
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAdmin } from "@/context/AdminContext";

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();

  return (
    <SidebarProvider>
      <div className={cn(
        "min-h-screen flex w-full transition-colors duration-300",
        isAdmin ? "bg-[#FEE2E2]/20" : "bg-[#F2E9D2]/10"
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
            {/* Routes will be rendered here */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
