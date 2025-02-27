
import React from "react";
import { Outlet } from "react-router-dom";
import AppLayout from "@/components/layouts/AppLayout";

export function Dispatch() {
  return (
    <AppLayout>
      <div className="container py-6">
        <Outlet />
      </div>
    </AppLayout>
  );
}
