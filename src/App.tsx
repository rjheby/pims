
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import { Dashboard } from "@/pages/Dashboard";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import { WholesaleOrderForm } from "@/pages/WholesaleOrderForm";
import { SupplierOrderArchive } from "@/pages/supplier-order/SupplierOrderArchive";
import { NotFound } from "@/pages/NotFound";
import { useAdminContext } from "@/context/AdminContext";
import { UserContextProvider } from "@/context/UserContext";
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
  const { isAdminMode } = useAdminContext();

  useEffect(() => {
    document.body.style.backgroundColor = "#F7F7F7";
  }, []);

  return (
    <UserContextProvider>
      <AppLayout isAdminMode={isAdminMode}>
        <RouterProvider router={router} />
        <Toaster />
      </AppLayout>
    </UserContextProvider>
  );
}
