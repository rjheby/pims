
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminProvider } from "@/context/AdminContext";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "@/components/ui/toaster";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { WholesaleOrder } from "./pages/WholesaleOrder";
import { WholesaleOrderForm } from "./pages/WholesaleOrderForm";
import { WholesaleOrderForms } from "./pages/WholesaleOrderForms";
import { WholesaleOrderArchive } from "./pages/wholesale-order/WholesaleOrderArchive";
import { OrderView } from "./pages/wholesale-order/OrderView";
import Customers from "./pages/Customers";
import DriverPayments from "./pages/DriverPayments";
import { GeneratedOrder } from "./pages/GeneratedOrder";
import Production from "./pages/Production";
import TeamSettings from "./pages/TeamSettings";
import ClientOrder from "./pages/ClientOrder";
import DispatchDelivery from "./pages/DispatchDelivery";
import Inventory from "./pages/Inventory";
import { Dispatch } from "./pages/Dispatch";
import { DispatchSchedule } from "./pages/dispatch/DispatchSchedule";
import { DispatchArchive } from "./pages/dispatch/DispatchArchive";
import { DispatchForm } from "./pages/dispatch/DispatchForm";
import NotFound from "./pages/NotFound";

import "./App.css";
import { AdminOverlay } from "./components/AdminOverlay";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminProvider>
          <UserProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wholesale-order" element={<WholesaleOrder />} />
              <Route path="/wholesale-orders" element={<WholesaleOrderArchive />} />
              <Route path="/wholesale-orders/:id" element={<WholesaleOrderForm />} />
              <Route path="/wholesale-orders/:id/view" element={<OrderView />} />
              <Route path="/wholesale-order-forms" element={<WholesaleOrderForms />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/driver-payments" element={<DriverPayments />} />
              <Route path="/generated-order" element={<GeneratedOrder />} />
              <Route path="/production" element={<Production />} />
              <Route path="/team-settings" element={<TeamSettings />} />
              <Route path="/client-order" element={<ClientOrder />} />
              <Route path="/dispatch-delivery" element={<DispatchDelivery />} />
              <Route path="/inventory" element={<Inventory />} />
              
              {/* New Dispatch Routes */}
              <Route path="/dispatch" element={<Dispatch />}>
                <Route index element={<DispatchSchedule />} />
                <Route path="schedule" element={<DispatchSchedule />} />
                <Route path="archive" element={<DispatchArchive />} />
              </Route>
              <Route path="/dispatch/new" element={<DispatchForm />} />
              <Route path="/dispatch/schedule/:id" element={<DispatchForm />} />
              <Route path="/dispatch/archive/:id" element={<DispatchForm />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </AdminProvider>
        <AdminOverlay />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
