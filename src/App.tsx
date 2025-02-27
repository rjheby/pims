
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import { WholesaleOrderForm } from "@/pages/WholesaleOrderForm";
import { SupplierOrderArchive } from "@/pages/supplier-order/SupplierOrderArchive";
import NotFound from "@/pages/NotFound";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { UserProvider } from "@/context/UserContext";
import "./App.css";

const AppContent = () => {
  const { isAdmin } = useAdmin();

  useEffect(() => {
    document.body.style.backgroundColor = "#F7F7F7";
  }, []);

  return (
    <AppLayout isAdminMode={isAdmin}>
      <Toaster />
    </AppLayout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserProvider>
        <AdminProvider>
          <AppContent>
            <Dashboard />
          </AppContent>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-order",
    element: (
      <UserProvider>
        <AdminProvider>
          <AppContent>
            <WholesaleOrder />
          </AppContent>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-orders",
    element: (
      <UserProvider>
        <AdminProvider>
          <AppContent>
            <SupplierOrderArchive />
          </AppContent>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-orders/:id",
    element: (
      <UserProvider>
        <AdminProvider>
          <AppContent>
            <WholesaleOrderForm />
          </AppContent>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "*",
    element: (
      <UserProvider>
        <AdminProvider>
          <AppContent>
            <NotFound />
          </AppContent>
        </AdminProvider>
      </UserProvider>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
