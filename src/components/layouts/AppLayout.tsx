
import React, { ReactNode } from "react";
import { AppSidebar } from "../AppSidebar";
import { AdminOverlay } from "../AdminOverlay";
import { SidebarProvider } from "../ui/sidebar/sidebar-provider";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      {/* Admin overlay for edit mode */}
      <AdminOverlay />
      
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-col w-full bg-white">
          {/* Sidebar navigation with UserMenu integrated */}
          <AppSidebar />
          
          {/* Main content - improved bottom padding for mobile to account for fixed navigation */}
          <main className="flex-1 pt-20 pb-16 md:pb-10 px-4 overflow-x-hidden">
            <div className="max-w-screen-2xl mx-auto pb-20 md:pb-0 safe-area-bottom">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
