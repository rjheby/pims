
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { SidebarContent } from "./SidebarContent";
import { Logo } from "./Logo";

interface MobileMenuProps {
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export function MobileMenu({ isMobileMenuOpen, onMobileMenuToggle }: MobileMenuProps) {
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuToggle}>
      <SheetContent 
        side="left" 
        className="p-0 w-full sm:w-[300px] h-[100dvh] overflow-y-auto transition-transform duration-300 ease-in-out"
      >
        <div className="flex h-[72px] items-center justify-between px-4 border-b border-[#2A4131]/10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              className="hover:bg-[#F2E9D2]/50 md:hidden"
            >
              <X className="h-5 w-5 text-[#2A4131]" />
            </Button>
            <Logo />
          </div>
        </div>
        <SidebarContent onMobileMenuToggle={onMobileMenuToggle} />
      </SheetContent>
    </Sheet>
  );
}
