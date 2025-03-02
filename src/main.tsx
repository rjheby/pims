
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext'
import App from './App.tsx'
import './index.css'
import { HistoryProvider } from './context/HistoryContext'

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <HistoryProvider>
      <App />
    </HistoryProvider>
  </UserProvider>
);
