
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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

  const SidebarContent = () => (
    <>
      <div className="flex h-20 items-center border-b border-[#2A4131]/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-3 hover:bg-[#F2E9D2]/50 md:flex hidden"
        >
          <Menu className="h-5 w-5 text-[#2A4131]" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMobileMenuToggle}
          className="ml-3 hover:bg-[#F2E9D2]/50 md:hidden"
        >
          <X className="h-5 w-5 text-[#2A4131]" />
        </Button>
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="ml-3">
            <img 
              src="/lovable-uploads/ac2a865c-fa71-490a-a544-ff3ecd59d4d5.png"
              alt="Woodbourne Logo"
              className="h-12 w-auto"
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

  // Mobile menu
  return (
    <>
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onMobileMenuToggle}
        className="fixed top-4 left-4 z-50 md:hidden hover:bg-[#F2E9D2]/50"
      >
        <Menu className="h-5 w-5 text-[#2A4131]" />
      </Button>

      {/* Mobile slide-out menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuToggle}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <Sidebar className={cn(
        "border-r border-[#2A4131]/10 fixed left-0 top-0 h-screen transition-all duration-300 hidden md:block",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
      </Sidebar>
    </>
  );
}
