
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import { GlobalAdminControls } from "@/components/GlobalAdminControls";
import { WholesaleOrderProvider } from "@/pages/wholesale-order/context/WholesaleOrderContext";
import { useLocation, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ 
  children,
  isAdminMode = false,
}: { 
  children: React.ReactNode;
  isAdminMode?: boolean;
}) {
  const location = useLocation();
  const isWholesaleOrder = location.pathname === "/wholesale-order";

  return (
    <SidebarProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        {/* Admin Mode Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-red-500 bg-opacity-10 transition-opacity duration-500 pointer-events-none",
            isAdminMode ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Main Content with Top Navigation */}
        <div className="relative flex flex-col w-full">
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
            <div className="flex items-center justify-between h-[72px] px-4">
              <div className="flex items-center gap-4">
                <AppSidebar />
                <Link to="/" className="block md:hidden">
                  <img 
                    src="/lovable-uploads/2500bc58-0a71-4486-9a75-6d6eb06e9889.png"
                    alt="Mountain Logo"
                    className="h-8 w-8"
                  />
                </Link>
              </div>
              <GlobalAdminControls />
            </div>
          </div>
          
          <main className="w-full min-h-screen pt-[72px] overflow-x-hidden">
            <div className="w-[95%] mx-auto">
              {isWholesaleOrder ? (
                <WholesaleOrderProvider>
                  {children}
                </WholesaleOrderProvider>
              ) : children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
