
import { Routes, Route } from "react-router-dom";
import { WholesaleOrder } from "./pages/wholesale-order/WholesaleOrder";
import { WholesaleOrderForm } from "./pages/WholesaleOrderForm";
import { DispatchDelivery } from "./pages/DispatchDelivery";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import { AdminProvider } from "@/context/AdminContext";

function App() {
  return (
    <AdminProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<WholesaleOrder />} />
          <Route path="/wholesale-order" element={<WholesaleOrder />} />
          <Route path="/wholesale-order-form/:id" element={<WholesaleOrderForm />} />
          <Route path="/dispatch" element={<DispatchDelivery />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </AdminProvider>
  );
}

export default App;
