
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { UserProvider } from './context/UserContext';
import { HistoryProvider } from './context/HistoryContext';
import { AdminProvider } from './context/AdminContext';

// Layouts
import AppLayout from './components/layouts/AppLayout';

// Pages
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <UserProvider>
          <AdminProvider>
            <HistoryProvider>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </HistoryProvider>
          </AdminProvider>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
