
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, Truck } from "lucide-react";
import { menuGroups } from "./constants";
import { Logo } from "./Logo";

export function DesktopNavigation() {
  const location = useLocation();

  return (
    <div className="hidden md:block bg-white border-b border-[#2A4131]/10">
      <div className="flex items-center justify-between h-[72px] px-4 max-w-[95rem] mx-auto">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md",
                "transition-all duration-200 ease-in-out",
                location.pathname === "/" 
                  ? "bg-[#2A4131] text-white"
                  : "text-[#2A4131]/70 hover:bg-[#F2E9D2]/50"
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/dispatch"
              className={cn(
                "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md",
                "transition-all duration-200 ease-in-out",
                location.pathname === "/dispatch"
                  ? "bg-[#2A4131] text-white"
                  : "text-[#2A4131]/70 hover:bg-[#F2E9D2]/50"
              )}
            >
              <Truck className="h-4 w-4" />
              <span>Dispatch</span>
            </Link>
            {Object.entries(menuGroups).map(([key, group]) => (
              <DropdownMenu key={key}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium",
                      "transition-all duration-200 ease-in-out",
                      group.items.some(item => location.pathname === item.path)
                        ? "text-[#2A4131] bg-[#F2E9D2]"
                        : "text-[#2A4131]/70 hover:bg-[#F2E9D2]/50"
                    )}
                  >
                    {group.title}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {group.items.map((item) => (
                    <div key={item.path} className="w-[180px]">
                      <DropdownMenuItem asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer bg-white w-full",
                            "transition-all duration-200 ease-in-out",
                            location.pathname === item.path
                              ? "bg-[#2A4131] text-white"
                              : "text-[#2A4131] hover:bg-[#F2E9D2]/50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
