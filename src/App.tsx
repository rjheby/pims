
import { BrowserRouter } from "react-router-dom";
import { AdminProvider } from "./context/AdminContext";
import AppLayout from "./components/layouts/AppLayout";
import "./App.css";

import { WholesaleOrder } from "./pages/WholesaleOrder";

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AppLayout>
          <WholesaleOrder />
        </AppLayout>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
