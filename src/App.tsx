
import { Routes, Route, Navigate } from "react-router-dom";
import { WholesaleOrder } from "./pages/WholesaleOrder";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layouts/AppLayout";

function App() {
  return (
    <>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/wholesale-order" replace />} />
          <Route path="/wholesale-order" element={<WholesaleOrder />} />
        </Routes>
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;
