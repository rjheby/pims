
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import { UserProvider } from "@/context/UserContext";
import { AdminProvider } from "@/context/AdminContext";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminOverlay } from "./components/AdminOverlay";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import Production from "@/pages/Production";
import DispatchDelivery from "@/pages/DispatchDelivery";
import DriverPayments from "@/pages/DriverPayments";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import TeamSettings from "@/pages/TeamSettings";
import ClientOrder from "@/pages/ClientOrder";
import NotFound from "@/pages/NotFound";
import { GeneratedOrder } from "@/pages/GeneratedOrder";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <UserProvider>
        <AdminProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AdminOverlay />
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/wholesale-order" element={<WholesaleOrder />} />
                  <Route path="/generated-order/:encodedContent" element={<GeneratedOrder />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/dispatch" element={<DispatchDelivery />} />
                  <Route path="/driver-payments" element={<DriverPayments />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/team-settings" element={<TeamSettings />} />
                  <Route path="/client-order" element={<ClientOrder />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
              <Toaster />
            </div>
          </SidebarProvider>
        </AdminProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
