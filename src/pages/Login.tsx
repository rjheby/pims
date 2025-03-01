
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      setError("");
      setIsLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2E9D2]/30 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
            alt="Woodbourne Logo"
            className="h-16"
          />
        </div>
        
        <h1 className="mb-6 text-center text-2xl font-bold text-[#2A4131]">Sign In</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="email" className="text-[#2A4131]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#2A4131]">Password</Label>
              <Link to="/forgot-password" className="text-sm text-[#2A4131]/80 hover:text-[#2A4131]">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#2A4131] text-white hover:bg-[#2A4131]/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-[#2A4131]/70">Don't have an account?</span>{" "}
          <Link to="/signup" className="font-medium text-[#2A4131] hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
