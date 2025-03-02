
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";
import { GlobalAdminControls } from "@/components/GlobalAdminControls";
import { WholesaleOrderProvider } from "@/pages/wholesale-order/context/WholesaleOrderContext";
import { useLocation, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GlobalControls } from "@/components/GlobalControls";
import { useHistory } from "@/context/HistoryContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Component to handle keyboard shortcuts
function KeyboardShortcuts() {
  const history = useHistory();
  
  // Only proceed if history is available
  const { undo, redo, canUndo, canRedo } = history || { undo: () => {}, redo: () => {}, canUndo: false, canRedo: false };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }
      
      // Handle Ctrl+Y or Ctrl+Shift+Z for redo
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return null;
}

export default function AppLayout({ 
  children,
  isAdminMode = false,
}: { 
  children: React.ReactNode;
  isAdminMode?: boolean;
}) {
  const location = useLocation();
  const isWholesaleOrder = location.pathname === "/wholesale-order";
  const isMobile = useIsMobile();

  // Add extra padding at the bottom of the page for mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.paddingBottom = '140px'; // Increased padding for mobile
    } else {
      document.body.style.paddingBottom = '0';
    }
    
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [isMobile]);

  // Add a debug log to check if the AppLayout is rendering
  console.log("AppLayout rendering with children:", children);

  return (
    <SidebarProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        <KeyboardShortcuts />
        
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
                <div className="hidden md:block">
                  <GlobalControls />
                </div>
              </div>
              <GlobalAdminControls />
            </div>
          </div>
          
          <main className="w-full min-h-screen pt-[72px] pb-36 overflow-x-hidden">
            <div className="w-full px-3 md:w-[95%] mx-auto">
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
