
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/layouts/AppLayout";
import { UserProvider } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { AdminOverlay } from "./components/AdminOverlay";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AdminProvider>
          <AdminOverlay />
          <AppLayout />
          <Toaster />
        </AdminProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
