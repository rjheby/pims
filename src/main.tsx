
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext'
import App from './App.tsx'
import './index.css'
import { HistoryProvider } from './context/HistoryContext'
import { AuthProvider } from './context/AuthContext'

// Create root first
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
const root = createRoot(rootElement);

// Add debug logging
console.log("Initializing application with providers");

// Then render with properly nested providers
root.render(
  <AuthProvider>
    <UserProvider>
      <HistoryProvider>
        <App />
      </HistoryProvider>
    </UserProvider>
  </AuthProvider>
);
