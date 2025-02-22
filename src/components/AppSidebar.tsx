
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const location = useLocation();

  return (
    <Sidebar className={cn(
      "border-r border-[#2A4131]/10 relative transition-all duration-300",
      isCollapsed ? "w-0" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="absolute -right-4 top-6 z-50 bg-white shadow-md border p-1 h-8 w-8"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-[#2A4131]" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-[#2A4131]" />
        )}
      </Button>
      <SidebarContent>
        <div className="px-6 py-4">
          <img 
            src="/lovable-uploads/ac2a865c-fa71-490a-a544-ff3ecd59d4d5.png" 
            alt="Woodbourne Logo" 
            className="w-full h-auto"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-base font-medium text-[#2A4131]">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 text-[15px] transition-colors",
                        location.pathname === item.path 
                          ? "bg-[#2A4131] text-white" 
                          : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
