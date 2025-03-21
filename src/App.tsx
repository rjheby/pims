
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { UserProvider } from './context/UserContext';
import { HistoryProvider } from './context/HistoryContext';
import DateBasedScheduleCreator from './pages/DateBasedScheduleCreator';

// Note: We removed the global AdminProvider here because it's now in AppLayout

// Layouts
import AppLayout from './components/layouts/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import InventoryManagement from './pages/InventoryManagement';
import { WholesaleOrder } from './pages/WholesaleOrder';
import ClientOrder from './pages/ClientOrder';
import Dispatch from './pages/DispatchDelivery';
import DispatchArchive from './pages/DispatchArchive';
import DispatchForm from './pages/DispatchForm';
import DriverPayments from './pages/DriverPayments';
import Production from './pages/Production';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import TeamSettings from './pages/TeamSettings';

// Import WholesaleOrderForm and WholesaleOrderArchive correctly
import { WholesaleOrderForm } from './pages/WholesaleOrderForm';
import { WholesaleOrderArchive } from './pages/WholesaleOrderArchive';

// New imports for dispatch system
import DriversView from './pages/DriversView';
import DriverSchedule from './pages/DriverSchedule';

// Import new DispatchScheduleView component
import DispatchScheduleView from './pages/DispatchScheduleView';

// New authentication pages
import Auth from './pages/Auth';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <UserProvider>
          <HistoryProvider>
            <Routes>
              {/* Authentication */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Dashboard */}
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              
              {/* Orders Routes */}
              <Route path="/dispatch" element={<AppLayout><Dispatch /></AppLayout>} />
              <Route path="/dispatch-archive" element={<AppLayout><DispatchArchive /></AppLayout>} />
              <Route path="/dispatch-form/:id" element={<AppLayout><DispatchForm /></AppLayout>} />
              {/* New dispatch schedule view route */}
              <Route path="/dispatch-schedule" element={<AppLayout><DispatchScheduleView /></AppLayout>} />
              <Route path="/client-order" element={<AppLayout><ClientOrder /></AppLayout>} />
              <Route path="/wholesale-order" element={<AppLayout><WholesaleOrder /></AppLayout>} />
              <Route path="/wholesale-order-form" element={<AppLayout><WholesaleOrderForm /></AppLayout>} />
              <Route path="/wholesale-orders" element={<AppLayout><WholesaleOrderArchive /></AppLayout>} />
              <Route path="/wholesale-orders/:id" element={<AppLayout><WholesaleOrderForm /></AppLayout>} />
              <Route path="/schedule-creator" element={<AppLayout><DateBasedScheduleCreator /></AppLayout>} />
              
              {/* New dispatch system routes */}
              <Route path="/drivers" element={<AppLayout><DriversView /></AppLayout>} />
              <Route path="/driver-schedule/:driver_id/:date" element={<AppLayout><DriverSchedule /></AppLayout>} />
              
              {/* Reports Routes */}
              <Route path="/production" element={<AppLayout><Production /></AppLayout>} />
              <Route path="/driver-payments" element={<AppLayout><DriverPayments /></AppLayout>} />
              
              {/* Databases Routes */}
              <Route path="/customers" element={<AppLayout><Customers /></AppLayout>} />
              <Route path="/inventory" element={<AppLayout><Inventory /></AppLayout>} />
              <Route path="/inventory-management" element={<AppLayout><InventoryManagement /></AppLayout>} />
              
              {/* Settings */}
              <Route path="/team-settings" element={<AppLayout><TeamSettings /></AppLayout>} />
              <Route path="/user-management" element={<AppLayout><UserManagement /></AppLayout>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </HistoryProvider>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
