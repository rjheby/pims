
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-[#2A4131]/10">
      <SidebarContent>
        <div className="p-6">
          <img 
            src="/lovable-uploads/ac2a865c-fa71-490a-a544-ff3ecd59d4d5.png" 
            alt="Woodbourne Logo" 
            className="w-full h-auto mb-6"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 text-[#2A4131]/80 hover:text-[#2A4131] hover:bg-[#F2E9D2]/20",
                        location.pathname === item.path && "bg-[#2A4131] text-[#F2E9D2]"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
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
