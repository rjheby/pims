
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./constants";

interface MobileNavigationProps {
  onMobileMenuToggle: () => void;
}

export function MobileNavigation({ onMobileMenuToggle }: MobileNavigationProps) {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#2A4131]/10 md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-16",
              "transition-all duration-200 ease-in-out",
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
          onClick={onMobileMenuToggle}
          className="flex flex-col items-center justify-center w-16 h-16 text-[#2A4131] transition-colors duration-200"
        >
          <Menu className="h-6 w-6" />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
}
