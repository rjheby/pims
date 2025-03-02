
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/components/ui/use-toast";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setError("");
      setIsSubmitting(true);
      await signup(email, password, firstName, lastName);
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully. You are now logged in.",
      });
      // Redirecting to dashboard happens automatically after signup 
      // since we're auto-signing in for testing
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      
      toast({
        title: "Signup failed",
        description: err.message || "Unable to create account. Please try again.",
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
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your details to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Sign up"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-gray-600 w-full">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-[#2A4131] hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Signup;
