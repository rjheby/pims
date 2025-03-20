import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, signIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const clearLocalAuthData = () => {
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.token');
    
    window.location.reload();
    
    toast({
      title: "Session data cleared",
      description: "Please try signing in again.",
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setErrorMessage("Passwords do not match");
          toast({
            title: "Passwords do not match",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
          console.error("Sign up error:", error);
        } else {
          toast({
            title: "Account created",
            description: "Please check your email to confirm your account.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          console.error("Sign in error:", error);
          if (typeof error === 'object' && error !== null && 'message' in error) {
            setErrorMessage((error as any).message);
          } else {
            setErrorMessage("Failed to sign in. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast({
        title: "Authentication failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png"
              alt="Woodbourne Logo"
              className="h-12 w-auto object-contain" 
            />
          </div>
          <CardTitle>{isSignUp ? "Create an Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Enter your information to create an account" 
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
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
            </div>
            {isSignUp && (
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
            )}
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
            
            <div className="text-center text-sm">
              {isSignUp ? (
                <div>
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign in
                  </Button>
                </div>
              ) : (
                <div>
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary"
                    onClick={() => setIsSignUp(true)}
                  >
                    Create one
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 text-xs flex items-center gap-1"
              onClick={clearLocalAuthData}
            >
              <RefreshCw className="h-3 w-3" /> Clear Session Data
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
