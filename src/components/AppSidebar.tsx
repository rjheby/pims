
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  FileText, Users, Settings, BarChart, Truck, ClipboardList, 
  DollarSign, Menu, X, ArrowLeft, Warehouse, ChevronDown, Home, Archive, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const menuGroups = {
  reports: {
    title: "Reports",
    items: [
      { title: "Dashboard", icon: BarChart, path: "/dashboard" },
      { title: "Production Tracker", icon: BarChart, path: "/production" },
      { title: "Payments", icon: DollarSign, path: "/driver-payments" },
    ],
  },
  dispatch: {  // Updated dispatch group
    title: "Dispatch",
    items: [
      { title: "Create Schedule", icon: Truck, path: "/dispatch" },
      { title: "Date-Based Schedule", icon: Clock, path: "/schedule-creator" },
      { title: "Schedule View", icon: Calendar, path: "/dispatch-schedule" },
      { title: "Archive", icon: Archive, path: "/dispatch-archive" },
    ],
  },
  orders: {
    title: "Orders",
    items: [
      { title: "Client Orders", icon: FileText, path: "/client-order" },
      { title: "Supplier Form", icon: ClipboardList, path: "/wholesale-order" },
      { title: "Supplier Archives", icon: Archive, path: "/wholesale-orders" },
    ],
  },
  databases: {
    title: "Databases",
    items: [
      { title: "Customers", icon: Users, path: "/customers" },
      { title: "Inventory", icon: Warehouse, path: "/inventory" },
    ],
  },
  settings: {
    title: "Settings",
    items: [
      { title: "Settings", icon: Settings, path: "/team-settings" },
    ],
  },
};

const mobileNavItems = [
  { title: "Home", icon: Home, path: "/" },
  { title: "Dispatch", icon: Truck, path: "/dispatch" },
  { title: "Settings", icon: Settings, path: "/team-settings" },
];

const Logo = ({ variant = "full" }: { variant?: "full" | "icon" }) => (
  <Link to="/">
    {variant === "full" ? (
      <img 
        src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
        alt="Woodbourne Logo"
        className="h-10 w-auto object-contain"
      />
    ) : (
      <img 
        src="/lovable-uploads/2500bc58-0a71-4486-9a75-6d6eb06e9889.png"
        alt="Woodbourne Icon"
        className="h-8 w-8 object-contain"
      />
    )}
  </Link>
);

export function AppSidebar() {
  const location = useLocation();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const [showFullLogo, setShowFullLogo] = useState(false);

  // Check if window width is large enough for full logo (at least 1280px)
  useEffect(() => {
    const checkWindowSize = () => {
      setShowFullLogo(window.innerWidth >= 1280);
    };
    
    // Set initial value
    checkWindowSize();
    
    // Add event listener
    window.addEventListener('resize', checkWindowSize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkWindowSize);
    };
  }, []);

  const handleMenuItemClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const NavLink = ({ to, onClick = () => {}, isActive, className, children }) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 transition-all duration-200 ease-in-out",
        isActive 
          ? "bg-[#2A4131] text-white font-medium" 
          : "text-[#2A4131] hover:bg-[#F2E9D2]/50",
        className
      )}
    >
      {children}
    </Link>
  );

  const SidebarContent = () => (
    <>
      <div className="flex h-[72px] items-center justify-between px-4 border-b border-[#2A4131]/10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenMobile(false)}
            className="hover:bg-[#F2E9D2]/50 md:hidden"
          >
            <X className="h-5 w-5 text-[#2A4131]" />
          </Button>
          <Logo variant="full" />
        </div>
      </div>
      
      <SidebarMenu>
        {Object.values(menuGroups).map((group) => (
          <SidebarMenuItem key={group.title}>
            <div className="px-3 py-2 text-sm font-medium text-[#2A4131]/60">
              {group.title}
            </div>
            {group.items.map((item) => (
              <SidebarMenuButton key={item.path} asChild>
                <NavLink 
                  to={item.path} 
                  onClick={handleMenuItemClick}
                  isActive={location.pathname === item.path}
                  className="text-[15px] rounded-md"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            ))}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2A4131]/10 md:hidden z-50">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-16 transition-all duration-200 ease-in-out",
                location.pathname === item.path 
                  ? "text-[#2A4131] font-medium bg-[#F2E9D2]" 
                  : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          ))}
          <button
            onClick={() => setOpenMobile(true)}
            className="flex flex-col items-center justify-center w-16 h-16 text-[#2A4131] transition-colors duration-200"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent 
          side="left" 
          className="p-0 w-full sm:w-[300px] h-[100dvh] overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block bg-white border-b border-[#2A4131]/10">
        <div className="flex items-center justify-between h-[72px] px-4 max-w-[95rem] mx-auto">
          <div className="flex items-center gap-8">
            {showFullLogo ? (
              <Logo variant="full" />
            ) : (
              <Logo variant="icon" />
            )}
            <nav className="flex items-center gap-6">
              <NavLink 
                to="/"
                isActive={location.pathname === "/"}
                className="text-sm font-medium rounded-md"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </NavLink>
              <NavLink 
                to="/dispatch"
                isActive={location.pathname === "/dispatch"}
                className="text-sm font-medium rounded-md"
              >
                <Truck className="h-4 w-4" />
                <span>Dispatch</span>
              </NavLink>
              
              {Object.entries(menuGroups).map(([key, group]) => (
                <DropdownMenu key={key}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                        group.items.some(item => location.pathname === item.path)
                          ? "text-[#2A4131] bg-[#F2E9D2]"
                          : "text-[#2A4131]/70 hover:bg-[#F2E9D2]/50"
                      )}
                    >
                      {group.title}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[180px] bg-white"
                  >
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer transition-all duration-200 ease-in-out",
                            location.pathname === item.path
                              ? "bg-[#2A4131] text-white"
                              : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
