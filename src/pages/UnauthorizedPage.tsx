
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { currentUser } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2E9D2]/30 px-4 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-[#2A4131]">Access Denied</h1>
      <p className="mb-6 text-[#2A4131]/70">
        You don't have permission to access this page.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          className="bg-[#2A4131] text-white hover:bg-[#2A4131]/90"
        >
          <Link to="/">Go to Home</Link>
        </Button>
        
        {currentUser ? (
          <Button
            asChild
            variant="outline"
            className="border-[#2A4131] text-[#2A4131] hover:bg-[#2A4131]/10"
          >
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="border-[#2A4131] text-[#2A4131] hover:bg-[#2A4131]/10"
          >
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
