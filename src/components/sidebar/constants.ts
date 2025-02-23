
import {
  FileText,
  Users,
  Settings,
  BarChart,
  Truck,
  ClipboardList,
  LayoutDashboard,
  DollarSign,
  Warehouse,
} from "lucide-react";
import { MenuGroups } from "./types";

export const menuGroups: MenuGroups = {
  reports: {
    title: "Reports",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        title: "Production Tracker",
        icon: BarChart,
        path: "/production",
      },
      {
        title: "Payments",
        icon: DollarSign,
        path: "/driver-payments",
      },
    ],
  },
  orders: {
    title: "Orders",
    items: [
      {
        title: "Client Orders",
        icon: FileText,
        path: "/client-order",
      },
      {
        title: "Wholesale Orders",
        icon: ClipboardList,
        path: "/wholesale-order",
      },
    ],
  },
  databases: {
    title: "Databases",
    items: [
      {
        title: "Customers",
        icon: Users,
        path: "/customers",
      },
      {
        title: "Inventory",
        icon: Warehouse,
        path: "/inventory",
      },
    ],
  },
  settings: {
    title: "Settings",
    items: [
      {
        title: "Settings",
        icon: Settings,
        path: "/team-settings",
      },
    ],
  },
};

export const mobileNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Dispatch",
    icon: Truck,
    path: "/dispatch",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/team-settings",
  },
];
