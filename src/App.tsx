import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AppLayout } from "./components/layouts/AppLayout";
import { Index } from "./pages/Index";
import { Customers } from "./pages/Customers";
import { Dashboard } from "./pages/Dashboard";
import { Production } from "./pages/Production";
import { Inventory } from "./pages/Inventory";
import { DriverPayments } from "./pages/DriverPayments";
import { TeamSettings } from "./pages/TeamSettings";
import { WholesaleOrderArchive } from "./pages/wholesale-order/WholesaleOrderArchive";
import { WholesaleOrderForm } from "./pages/WholesaleOrderForm";
import { OrderView } from "./pages/wholesale-order/OrderView";
import { WholesaleOrder } from "./pages/WholesaleOrder";
import { DispatchDelivery } from "./pages/DispatchDelivery";
import { ClientOrder } from "./pages/ClientOrder";
import { NotFound } from "./pages/NotFound";
import { TemplateManagement } from "./pages/wholesale-order/TemplateManagement";
import { Toaster } from "./components/ui/toaster";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/customers",
        element: <Customers />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/production",
        element: <Production />,
      },
      {
        path: "/inventory",
        element: <Inventory />,
      },
      {
        path: "/drivers-payments",
        element: <DriverPayments />,
      },
      {
        path: "/team-settings",
        element: <TeamSettings />,
      },
      {
        path: "/wholesale-orders",
        element: <WholesaleOrderArchive />,
      },
      {
        path: "/wholesale-orders/:id",
        element: <WholesaleOrderForm />,
      },
      {
        path: "/wholesale-orders/:id/view",
        element: <OrderView />,
      },
      {
        path: "/wholesale-order",
        element: <WholesaleOrder />,
      },
      {
        path: "/dispatch-delivery",
        element: <DispatchDelivery />,
      },
      {
        path: "/client-order",
        element: <ClientOrder />,
      },
      {
        path: "/wholesale-orders/templates",
        element: <TemplateManagement />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <RouterProvider router={Router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
