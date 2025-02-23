
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import DispatchDelivery from "./pages/DispatchDelivery";
import ClientOrder from "./pages/ClientOrder";
import WholesaleOrder from "./pages/WholesaleOrder";
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
          <div className="min-h-screen flex w-full">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dispatch" element={<DispatchDelivery />} />
                <Route path="/driver-payments" element={<DriverPayments />} />
                <Route path="/client-order" element={<ClientOrder />} />
                <Route path="/wholesale-order" element={<WholesaleOrder />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/team-settings" element={<TeamSettings />} />
                <Route path="/production" element={<Production />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
