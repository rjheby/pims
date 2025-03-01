
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName) {
      setError("All fields are required");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setError("");
      setIsLoading(true);
      await signup(email, password, firstName, lastName);
      navigate("/login", { 
        state: { message: "Please check your email to verify your account" }
      });
    } catch (err: any) {
      setError(err.message || "Failed to create an account");
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
        
        <h1 className="mb-6 text-center text-2xl font-bold text-[#2A4131]">Create an Account</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup}>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-[#2A4131]">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-[#2A4131]">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="mt-1"
                required
              />
            </div>
          </div>
          
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
            <Label htmlFor="password" className="text-[#2A4131]">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
            />
            <p className="mt-1 text-xs text-[#2A4131]/60">
              Password must be at least 6 characters
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#2A4131] text-white hover:bg-[#2A4131]/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <span className="text-[#2A4131]/70">Already have an account?</span>{" "}
          <Link to="/login" className="font-medium text-[#2A4131] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
