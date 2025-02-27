
import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import { WholesaleOrderForm } from "@/pages/WholesaleOrderForm";
import { WholesaleOrderArchive } from "@/pages/wholesale-order/WholesaleOrderArchive";
import { Schedule } from "@/pages/dispatch/Schedule";
import { DispatchArchives } from "@/pages/dispatch/DispatchArchives";
import { DispatchArchiveDetail } from "@/pages/dispatch/DispatchArchiveDetail";
import NotFound from "@/pages/NotFound";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { UserProvider } from "@/context/UserContext";
import "./App.css";

function PageWrapper({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin();

  useEffect(() => {
    document.body.style.backgroundColor = "#F7F7F7";
  }, []);

  return (
    <AppLayout isAdminMode={isAdmin}>
      {children}
      <Toaster />
    </AppLayout>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <Dashboard />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-order",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <WholesaleOrder />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-orders",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <WholesaleOrderArchive />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/wholesale-orders/:id",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <WholesaleOrderForm />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/dispatch/schedule",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <Schedule />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/dispatch/archives",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <DispatchArchives />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "/dispatch/archives/:id",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <DispatchArchiveDetail />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
  {
    path: "*",
    element: (
      <UserProvider>
        <AdminProvider>
          <PageWrapper>
            <NotFound />
          </PageWrapper>
        </AdminProvider>
      </UserProvider>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
