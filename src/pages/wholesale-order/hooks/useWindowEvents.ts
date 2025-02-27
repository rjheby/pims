
import { useEffect } from "react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useAdmin } from "@/context/AdminContext";

export function useWindowEvents() {
  const wholesaleOrder = useWholesaleOrder();
  const { hasUnsavedChanges, setHasUnsavedChanges } = useAdmin();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
