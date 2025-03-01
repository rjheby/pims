
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext'
import App from './App.tsx'
import './index.css'
import { HistoryProvider } from './context/HistoryContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <UserProvider>
      <HistoryProvider>
        <App />
      </HistoryProvider>
    </UserProvider>
  </AuthProvider>
);
