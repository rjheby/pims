
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import { GlobalAdminControls } from "@/components/GlobalAdminControls";
import { WholesaleOrderProvider } from "@/pages/wholesale-order/context/WholesaleOrderContext";
import { useLocation } from "react-router-dom";

export default function AppLayout({ 
  children,
  isAdminMode = false,
}: { 
  children: React.ReactNode;
  isAdminMode?: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isWholesaleOrder = location.pathname === "/wholesale-order";

  const content = (
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between h-[72px] px-4 max-w-[95rem] mx-auto">
            <AppSidebar 
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            <GlobalAdminControls />
          </div>
        </div>
        
        <main className="w-full min-h-screen px-2 md:px-4 pb-20 md:pb-8 pt-[72px]">
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  return isWholesaleOrder ? (
    <WholesaleOrderProvider>
      {content}
    </WholesaleOrderProvider>
  ) : content;
}
