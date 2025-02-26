
import { Routes, Route, Navigate } from "react-router-dom";
import { WholesaleOrder } from "./pages/WholesaleOrder";
import { WholesaleOrderForm } from "./pages/WholesaleOrderForm";
import { SupplierOrderArchive } from "./pages/supplier-order/SupplierOrderArchive";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";
import { AdminProvider } from "@/context/AdminContext";
import DispatchDelivery from "./pages/DispatchDelivery";

function App() {
  return (
    <AdminProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/wholesale-order" replace />} />
          <Route path="/wholesale-order" element={<WholesaleOrder />} />
          <Route path="/wholesale-order-form/:id" element={<WholesaleOrderForm />} />
          <Route path="/wholesale-orders" element={<SupplierOrderArchive />} />
          <Route path="/dispatch-delivery" element={<DispatchDelivery />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </AdminProvider>
  );
}

export default App;
