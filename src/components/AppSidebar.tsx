
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
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center absolute left-0 top-0 h-16 w-full border-b border-[#2A4131]/10 px-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="hover:bg-[#F2E9D2]/50"
        >
          <Menu className="h-5 w-5 text-[#2A4131]" />
        </Button>
      </div>
      <SidebarContent className="mt-16">
        <div className={cn(
          "px-6 py-4 transition-all duration-300",
          isCollapsed ? "px-2" : "px-6"
        )}>
          {isCollapsed ? (
            <img 
              src="/lovable-uploads/ac2a865c-fa71-490a-a544-ff3ecd59d4d5.png"
              alt="Woodbourne Logo"
              className="w-10 h-10 object-contain mx-auto"
            />
          ) : (
            <img 
              src="/lovable-uploads/ac2a865c-fa71-490a-a544-ff3ecd59d4d5.png"
              alt="Woodbourne Logo"
              className="w-full h-auto"
            />
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "px-6 text-base font-medium text-[#2A4131]",
            isCollapsed && "sr-only"
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
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 text-[15px] transition-colors",
                        isCollapsed && "px-3 justify-center",
                        location.pathname === item.path 
                          ? "bg-[#2A4131] text-white" 
                          : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
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
