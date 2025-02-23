
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <div className="min-h-screen flex w-full bg-[#F2E9D2]/10">
        <AppSidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className={cn(
          "flex-1 transition-all duration-300 pb-20 md:pb-4 overflow-x-hidden",
          "p-2 sm:p-3",
          isCollapsed ? "md:ml-16" : "md:ml-[16.5rem]" // Adjusted for tighter spacing
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
