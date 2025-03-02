
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { AppSidebar } from "@/components/AppSidebar"; 
import { SidebarProvider } from "@/components/ui/sidebar";

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
      
      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid login credentials. Please check your email and password.");
      
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
      
      // Skip the account creation attempt since it may be failing
      await login("test@example.com", "password123");
      
      toast({
        title: "Test Login",
        description: "Logged in with test account",
      });
      
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Test login error:", err);
      
      // More informative error message
      const errorMessage = "Test login failed. Please make sure the test account exists in Supabase.";
      setError(errorMessage);
      
      toast({
        title: "Test login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <AppSidebar />
        
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <Card className="w-full mx-auto max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] 2xl:max-w-[40%]">
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex justify-center">
                <img 
                  src="/lovable-uploads/2928b0a2-c7b1-43a0-8d17-f9230de4d3b5.png" 
                  alt="Company Logo" 
                  className="h-16 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    target.alt = "Logo not found";
                  }} 
                />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
              <CardDescription className="text-center">
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
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-center">
                    <span className="text-sm text-gray-700 font-medium">Testing?</span>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="text-right">Email:</div>
                      <div className="text-left font-mono">test@example.com</div>
                      <div className="text-right">Password:</div>
                      <div className="text-left font-mono">password123</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 w-full border-[#2A4131] text-[#2A4131]"
                      onClick={handleTestLogin}
                      disabled={isSubmitting}
                    >
                      Quick Test Login
                    </Button>
                  </div>
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
      </div>
    </SidebarProvider>
  );
};

export default Login;
