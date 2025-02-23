
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/layouts/AppLayout";
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { AdminOverlay } from "./components/AdminOverlay";
import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/pages/Dashboard";
import { WholesaleOrder } from "@/pages/WholesaleOrder";
import Production from "@/pages/Production";
import DispatchDelivery from "@/pages/DispatchDelivery";
import DriverPayments from "@/pages/DriverPayments";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import TeamSettings from "@/pages/TeamSettings";
import ClientOrder from "@/pages/ClientOrder";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AdminProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AdminOverlay />
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/wholesale-order" element={<WholesaleOrder />} />
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
    </BrowserRouter>
  );
}

export default App;
