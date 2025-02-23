
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";

interface AdminOverlayProps {
  className?: string;
  indicatorClassName?: string;
  customIndicator?: React.ReactNode;
}

export function AdminOverlay({ 
  className,
  indicatorClassName,
  customIndicator
}: AdminOverlayProps) {
  const { isAdmin } = useAdmin();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-red-500 bg-opacity-10 transition-opacity duration-500 pointer-events-none",
          isAdmin ? "opacity-100" : "opacity-0",
          className
        )}
      />
      {isAdmin && (
        customIndicator || (
          <div className={cn(
            "fixed top-2 right-4 z-50 animate-pulse text-sm px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg",
            indicatorClassName
          )}>
            Admin Mode Active
          </div>
        )
      )}
    </>
  );
}
