
import React, { ReactNode } from "react";
import { AppSidebar } from "../AppSidebar";
import { AdminOverlay } from "../AdminOverlay";
import { SidebarProvider } from "../ui/sidebar/sidebar-provider";
import { GlobalAdminControls } from "../GlobalAdminControls";
import { UserMenu } from "../UserMenu";

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
          {/* Fixed header with admin controls */}
          <header className="fixed top-0 right-0 z-40 p-2">
            <div className="flex items-center justify-end gap-2 mr-2">
              <UserMenu />
              <GlobalAdminControls />
            </div>
          </header>
          
          {/* Sidebar navigation */}
          <AppSidebar />
          
          {/* Main content */}
          <main className="flex-1 pt-20 pb-16 md:pb-10 px-4">
            <div className="max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
