import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { UserProvider } from './context/UserContext';

// Layouts
import AppLayout from './components/layouts/AppLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import WholesaleOrder from './pages/wholesale-order/WholesaleOrder';
import WholesaleOrderList from './pages/wholesale-order/WholesaleOrderList';
import InventoryManagement from './pages/InventoryManagement';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <UserProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
            <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
            
            {/* App Routes */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            
            {/* Wholesale Order Routes */}
            <Route path="/wholesale-order" element={<AppLayout><WholesaleOrder /></AppLayout>} />
            <Route path="/wholesale-order/:id" element={<AppLayout><WholesaleOrder /></AppLayout>} />
            <Route path="/wholesale-orders" element={<AppLayout><WholesaleOrderList /></AppLayout>} />
            
            {/* Inventory Management */}
            <Route 
              path="/inventory-management" 
              element={
                <AppLayout>
                  <InventoryManagement />
                </AppLayout>
              } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
