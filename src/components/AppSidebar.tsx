
import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Settings,
  Users,
  FileText,
  Package,
  ShoppingBag,
  BarChart3,
  Truck,
  Archive,
  CalendarClock,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar/menu";

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <div className="flex h-full flex-col gap-4">
        <div className="flex h-[72px] items-center px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img 
              src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
              alt="Mountain Logo"
              className="w-6 h-6"
            />
            <span className="group-[.collapsed]:invisible group-[.collapsed]:w-0">
              Woodbourne
            </span>
          </Link>
          <SidebarTrigger className="ml-auto" />
        </div>
        <SidebarContent className="pb-8">
          <SidebarMenu className="px-4">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/dashboard"}
              >
                <Link to="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === "/wholesale-order" || 
                  location.pathname === "/wholesale-orders" ||
                  location.pathname.startsWith("/wholesale-orders/")
                }
              >
                <Link to="/wholesale-order">
                  <Package />
                  <span>Supplier Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  location.pathname === "/client-order"
                }
              >
                <Link to="/client-order">
                  <ShoppingBag />
                  <span>Customer Orders</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={
                  location.pathname === "/dispatch" || 
                  location.pathname.startsWith("/dispatch/")
                }
              >
                <Truck />
                <span>Dispatch</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={
                      location.pathname === "/dispatch" || 
                      location.pathname === "/dispatch/schedule" ||
                      location.pathname === "/dispatch/new" ||
                      location.pathname.startsWith("/dispatch/schedule/")
                    }
                  >
                    <Link to="/dispatch/schedule">
                      <CalendarClock className="h-4 w-4" />
                      <span>Schedule</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={
                      location.pathname === "/dispatch/archive" ||
                      location.pathname.startsWith("/dispatch/archive/")
                    }
                  >
                    <Link to="/dispatch/archive">
                      <Archive className="h-4 w-4" />
                      <span>Archives</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/inventory"}
              >
                <Link to="/inventory">
                  <BarChart3 />
                  <span>Inventory</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/customers"}
              >
                <Link to="/customers">
                  <Users />
                  <span>Customers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === "/team-settings"}
              >
                <Link to="/team-settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
