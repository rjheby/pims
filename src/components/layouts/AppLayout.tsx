
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <div className="min-h-screen flex w-full bg-[#F2E9D2]/10">
        <AppSidebar 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main className={cn(
          "flex-1 p-6 transition-all duration-300",
          isCollapsed ? "ml-0" : "ml-64"
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
