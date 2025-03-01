import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layouts/AppLayout";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import DriverPayments from "./pages/DriverPayments";
import TeamSettings from "./pages/TeamSettings";
import WholesaleOrderForm from "./pages/WholesaleOrderForm";
import { WholesaleOrderForms } from "./pages/WholesaleOrderForms";
import DispatchDelivery from "./pages/DispatchDelivery";
import ClientOrder from "./pages/ClientOrder";
import NotFound from "./pages/NotFound";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Permissions } from "./types/permissions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Main App Routes - Protected by Authentication */}
        <Route
          path="/"
          element={
            <AppLayout>
              <Index />
            </AppLayout>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/customers"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.VIEW_ALL_PAGES}>
                <Customers />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/production"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.VIEW_ALL_PAGES}>
                <Production />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/inventory"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.VIEW_ALL_PAGES}>
                <Inventory />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/driver-payments"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.VIEW_PAYMENTS}>
                <DriverPayments />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/team-settings"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.ADMIN_ACCESS}>
                <TeamSettings />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/dispatch"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.ACCESS_DISPATCH}>
                <DispatchDelivery />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/client-order"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.SUBMIT_ORDERS}>
                <ClientOrder />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/wholesale-order"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.SUBMIT_ORDERS}>
                <WholesaleOrderForm />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route
          path="/wholesale-orders"
          element={
            <AppLayout>
              <ProtectedRoute requiredPermission={Permissions.VIEW_ALL_PAGES}>
                <WholesaleOrderForms />
              </ProtectedRoute>
            </AppLayout>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
