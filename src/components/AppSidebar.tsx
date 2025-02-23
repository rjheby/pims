
import { MobileNavigation } from "./sidebar/MobileNavigation";
import { MobileMenu } from "./sidebar/MobileMenu";
import { DesktopNavigation } from "./sidebar/DesktopNavigation";
import { AppSidebarProps } from "./sidebar/types";

export function AppSidebar({ 
  isCollapsed, 
  onToggleCollapse,
  isMobileMenuOpen,
  onMobileMenuToggle 
}: AppSidebarProps) {
  return (
    <>
      <MobileNavigation onMobileMenuToggle={onMobileMenuToggle} />
      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={onMobileMenuToggle}
      />
      <DesktopNavigation />
    </>
  );
}
