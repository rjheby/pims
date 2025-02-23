
export interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export interface MenuItem {
  title: string;
  icon: React.ComponentType;
  path: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export type MenuGroups = {
  [key: string]: MenuGroup;
}
