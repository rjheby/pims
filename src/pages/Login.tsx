import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      setError("");
      setIsSubmitting(true);
      await login(email, password);
      
      // Show success message
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid login credentials. Please check your email and password.");
      
      // Show error toast
      toast({
        title: "Login failed",
        description: "Invalid login credentials. Please check your email and password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      
      // First create a test account if it doesn't exist
      try {
        await fetch('/api/create-test-account', {
          method: 'POST',
        });
      } catch (e) {
        console.log("Test account may already exist", e);
      }
      
      // Then login with test credentials
      await login("test@example.com", "password123");
      
      toast({
        title: "Test Login",
        description: "Logged in with test account",
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setError("Test login failed. The test account may not exist yet.");
      console.error("Test login error:", err);
      
      toast({
        title: "Test login failed",
        description: "Could not log in with test account. Please try signing up with these credentials first.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#2A4131] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-500">Testing? Use:</span>
              <div className="mt-1 flex flex-col gap-1 text-xs text-gray-500">
                <div>Email: test@example.com</div>
                <div>Password: password123</div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full border-[#2A4131] text-[#2A4131]"
                onClick={handleTestLogin}
                disabled={isSubmitting}
              >
                Quick Test Login
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 w-full">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-[#2A4131] hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
