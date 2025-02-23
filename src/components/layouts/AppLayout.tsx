
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import { GlobalAdminControls } from "@/components/GlobalAdminControls";

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

      {/* Main Content with Top Navigation */}
      <div className="relative flex flex-col">
        <AppSidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <div className="fixed top-0 right-0 z-50 px-4 py-2 bg-white border-b border-l border-[#2A4131]/10">
          <GlobalAdminControls />
        </div>
        <main className="w-full min-h-screen px-2 md:px-4 pb-20 md:pb-8 pt-[72px]">
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
