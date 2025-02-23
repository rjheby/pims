
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  SidebarContent as SidebarContentBase,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { menuGroups } from "./constants";
import { HTMLAttributes } from "react";

interface SidebarContentProps extends HTMLAttributes<HTMLDivElement> {
  onMobileMenuToggle: () => void;
}

export function SidebarContent({ onMobileMenuToggle, ...props }: SidebarContentProps) {
  const location = useLocation();

  const handleMenuItemClick = () => {
    if (window.innerWidth < 768) {
      onMobileMenuToggle();
    }
  };

  return (
    <div {...props}>
      <SidebarContentBase>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.values(menuGroups).map((group) => (
                <SidebarMenuItem key={group.title}>
                  <div className="px-3 py-2 text-sm font-medium text-[#2A4131]/60">
                    {group.title}
                  </div>
                  {group.items.map((item) => (
                    <div key={item.path}>
                      <div className="px-2">
                        <Link
                          to={item.path}
                          onClick={handleMenuItemClick}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-[15px] rounded-md",
                            "transition-all duration-200 ease-in-out",
                            location.pathname === item.path 
                              ? "bg-[#2A4131] text-white font-medium" 
                              : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContentBase>
    </div>
  );
}
