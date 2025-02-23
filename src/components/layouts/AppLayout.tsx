
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

  const adminControls = (
    <div className="fixed top-0 right-0 z-50 px-4 py-2 bg-white">
      <GlobalAdminControls />
    </div>
  );

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
        {isWholesaleOrder ? (
          <WholesaleOrderProvider>
            {adminControls}
            <main className="w-full min-h-screen px-2 md:px-4 pb-20 md:pb-8 pt-[72px]">
              <div className="py-4">
                {children}
              </div>
            </main>
          </WholesaleOrderProvider>
        ) : (
          <>
            {adminControls}
            <main className="w-full min-h-screen px-2 md:px-4 pb-20 md:pb-8 pt-[72px]">
              <div className="py-4">
                {children}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
