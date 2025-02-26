
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import { WholesaleOrderForm } from "@/pages/WholesaleOrderForm";
import { SupplierOrderArchive } from "@/pages/supplier-order/SupplierOrderArchive";
import NotFound from "@/pages/NotFound";
import { useAdmin } from "@/context/AdminContext";
import { UserProvider } from "@/context/UserContext";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/wholesale-order",
    element: <WholesaleOrder />,
  },
  {
    path: "/wholesale-orders",
    element: <SupplierOrderArchive />,
  },
  {
    path: "/wholesale-orders/:id",
    element: <WholesaleOrderForm />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  const { isAdmin } = useAdmin();

  useEffect(() => {
    document.body.style.backgroundColor = "#F7F7F7";
  }, []);

  return (
    <UserProvider>
      <AppLayout isAdminMode={isAdmin}>
        <RouterProvider router={router} />
        <Toaster />
      </AppLayout>
    </UserProvider>
  );
}
