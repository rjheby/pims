
import { BrowserRouter } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import AppLayout from "./components/layouts/AppLayout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppLayout />
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
