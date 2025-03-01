
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-full bg-red-100 p-6 text-red-600 mx-auto w-24 h-24 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-12 w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Access Denied
        </h1>
        <p className="text-lg text-gray-600">
          You don't have permission to access this page.
          Please contact your administrator if you believe you should have access.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-[#2A4131] text-[#2A4131]"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
