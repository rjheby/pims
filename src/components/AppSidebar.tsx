
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FileText,
  Database,
  Settings,
  BarChart,
  Truck,
  ClipboardList,
  LayoutDashboard,
  DollarSign,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Main Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Dispatch & Delivery",
    icon: Truck,
    path: "/dispatch",
  },
  {
    title: "Driver Payments",
    icon: DollarSign,
    path: "/driver-payments",
  },
  {
    title: "Client Order Form",
    icon: FileText,
    path: "/client-order",
  },
  {
    title: "Wholesale Order Form",
    icon: ClipboardList,
    path: "/wholesale-order",
  },
  {
    title: "Customer Database",
    icon: Database,
    path: "/customers",
  },
  {
    title: "Inventory Master List",
    icon: FileText,
    path: "/inventory",
  },
  {
    title: "Team Settings",
    icon: Settings,
    path: "/team-settings",
  },
  {
    title: "Production Tracker",
    icon: BarChart,
    path: "/production",
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

  const SidebarComponent = () => (
    <>
      <div className="flex h-24 items-center justify-between border-b border-[#2A4131]/10 px-3">
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
          <div className="flex-1 flex justify-center">
            <img 
              src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
              alt="Woodbourne Logo"
              className="h-16 w-auto"
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
              className="w-12 h-12 object-contain mx-auto"
            />
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "px-6 text-base font-medium text-[#2A4131]",
            isCollapsed && !isMobileMenuOpen && "sr-only"
          )}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      onClick={() => onMobileMenuToggle()}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 text-[15px] transition-colors",
                        isCollapsed && !isMobileMenuOpen && "px-3 justify-center",
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
          className="p-0 w-full sm:w-[380px] h-[100dvh] overflow-y-auto"
        >
          <SidebarComponent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <Sidebar className={cn(
        "border-r border-[#2A4131]/10 fixed left-0 top-0 h-screen transition-all duration-300 hidden md:block",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarComponent />
      </Sidebar>
    </>
  );
}
