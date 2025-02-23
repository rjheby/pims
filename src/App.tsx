
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppLayout from "./components/layouts/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import DispatchDelivery from "./pages/DispatchDelivery";
import ClientOrder from "./pages/ClientOrder";
import { WholesaleOrder } from "./pages/WholesaleOrder";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import TeamSettings from "./pages/TeamSettings";
import Production from "./pages/Production";
import DriverPayments from "./pages/DriverPayments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/dispatch" element={<AppLayout><DispatchDelivery /></AppLayout>} />
              <Route path="/driver-payments" element={<AppLayout><DriverPayments /></AppLayout>} />
              <Route path="/client-order" element={<AppLayout><ClientOrder /></AppLayout>} />
              <Route path="/wholesale-order" element={<AppLayout><WholesaleOrder /></AppLayout>} />
              <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
              <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
              <Route path="/team-settings" element={<AppLayout><TeamSettings /></AppLayout>} />
              <Route path="/production" element={<AppLayout><Production /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
