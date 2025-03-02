
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layouts/AppLayout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import { WholesaleOrder } from '@/pages/WholesaleOrder';
import NotFound from '@/pages/NotFound';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import './App.css';

function App() {
  const auth = useAuth();
  
  // Debug app rendering and auth state
  useEffect(() => {
    console.log("App component mounted, auth state:", auth?.currentUser ? "Logged in" : "Not logged in");
  }, [auth]);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            auth?.currentUser ? <Navigate to="/" /> : <Login />
          } 
        />
        <Route 
          path="/signup" 
          element={
            auth?.currentUser ? <Navigate to="/" /> : <Signup />
          } 
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected routes - wrapped in AppLayout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Index />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wholesale-order" 
          element={
            <ProtectedRoute>
              <AppLayout isAdminMode={true}>
                <WholesaleOrder />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
