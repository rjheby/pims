
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { UserProvider } from './context/UserContext';

// Layouts
import AppLayout from './components/layouts/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import InventoryManagement from './pages/InventoryManagement';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <UserProvider>
        <Router>
          <Routes>
            {/* App Routes */}
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            
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
