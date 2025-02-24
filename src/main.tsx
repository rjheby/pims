
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext' // Import UserProvider
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <UserProvider> {/* Wrap the app in UserProvider */}
      <App />
    </UserProvider>
  </BrowserRouter>
);
