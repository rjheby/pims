
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FileText,
  Users,
  Settings,
  BarChart,
  Truck,
  ClipboardList,
  LayoutDashboard,
  DollarSign,
  Menu,
  X,
  ArrowLeft,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Dispatch",
    icon: Truck,
    path: "/dispatch",
  },
  {
    title: "Client Orders",
    icon: FileText,
    path: "/client-order",
  },
  {
    title: "Wholesale Orders",
    icon: ClipboardList,
    path: "/wholesale-order",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    title: "Inventory",
    icon: Warehouse,
    path: "/inventory",
  },
  {
    title: "Production Tracker",
    icon: BarChart,
    path: "/production",
  },
  {
    title: "Payments",
    icon: DollarSign,
    path: "/driver-payments",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/team-settings",
  },
];

const mobileNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Dispatch",
    icon: Truck,
    path: "/dispatch",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/team-settings",
  },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function AppSidebar({ 
  isCollapsed, 
  onToggleCollapse,
  isMobileMenuOpen,
  onMobileMenuToggle 
}: AppSidebarProps) {
  const location = useLocation();

  const handleMenuItemClick = () => {
    if (window.innerWidth < 768) {
      onMobileMenuToggle();
    }
  };

  const SidebarComponent = () => (
    <>
      <div className="flex h-[72px] items-center justify-between border-b border-[#2A4131]/10 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="hover:bg-[#F2E9D2]/50 md:flex hidden"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5 text-[#2A4131]" />
          ) : (
            <ArrowLeft className="h-5 w-5 text-[#2A4131]" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="hover:bg-[#F2E9D2]/50 md:hidden"
        >
          <X className="h-5 w-5 text-[#2A4131]" />
        </Button>
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="flex-1 flex justify-center items-center">
            <img 
              src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
              alt="Woodbourne Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
      </div>
      
      <SidebarContent>
        {isCollapsed && !isMobileMenuOpen && (
          <div className="px-2 py-4">
            <img 
              src="/lovable-uploads/2928b0a2-c7b1-43a0-8d17-f9230de4d3b5.png"
              alt="Woodbourne Icon"
              className="w-8 h-8 object-contain mx-auto"
            />
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      onClick={handleMenuItemClick}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-[15px] transition-colors",
                        isCollapsed && !isMobileMenuOpen && "justify-center",
                        location.pathname === item.path 
                          ? "bg-[#2A4131] text-white" 
                          : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {(!isCollapsed || isMobileMenuOpen) && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );

  return (
    <>
      {/* Mobile bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2A4131]/10 md:hidden z-50">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 text-[#2A4131] transition-colors",
                location.pathname === item.path && "text-[#2A4131] font-medium"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
          <button
            onClick={onMobileMenuToggle}
            className="flex flex-col items-center justify-center w-16 h-16 text-[#2A4131]"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuToggle}>
        <SheetContent 
          side="left" 
          className="p-0 w-full sm:w-[300px] h-[100dvh] overflow-y-auto"
        >
          <SidebarComponent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <Sidebar 
        style={{
          '--sidebar-width': isCollapsed ? '4rem' : '12rem'
        } as React.CSSProperties}
        className={cn(
          "border-r border-[#2A4131]/10 fixed left-0 top-0 h-screen transition-all duration-300 hidden md:block bg-white",
          "w-[var(--sidebar-width)]"
        )}
      >
        <SidebarComponent />
      </Sidebar>
    </>
  );
}
