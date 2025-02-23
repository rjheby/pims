
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

export function AdminOverlay() {
  const { isAdmin } = useAdmin();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-red-500 bg-opacity-10 transition-opacity duration-500 pointer-events-none",
          isAdmin ? "opacity-100" : "opacity-0"
        )}
      />
      {isAdmin && (
        <div className="fixed top-2 right-4 z-50 animate-pulse text-sm px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg">
          Admin Mode Active
        </div>
      )}
    </>
  );
}
