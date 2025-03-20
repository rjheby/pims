
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, RefreshCw, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { supabase, checkSupabaseHealth } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{isHealthy: boolean, error: string | null} | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
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

  // Check Supabase health on component mount and when connectionAttempts changes
  useEffect(() => {
    const checkHealth = async () => {
      setIsCheckingHealth(true);
      const health = await checkSupabaseHealth();
      setSupabaseStatus(health);
      setIsCheckingHealth(false);
      
      if (!health.isHealthy) {
        toast({
          title: "Connection issue detected",
          description: "There may be issues connecting to the database.",
          variant: "destructive",
        });
      }
    };
    
    checkHealth();
  }, [toast, connectionAttempts]);

  const clearLocalAuthData = () => {
    // Only clear the specific auth token, not all auth-related data
    localStorage.removeItem('woodbourne-auth-token');
    
    // Increment connection attempts to trigger a health check
    setConnectionAttempts(prev => prev + 1);
    
    // Reset form state
    setIsSubmitting(false);
    setErrorMessage(null);
    
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
        try {
          const { error } = await signIn(email, password);
          
          if (error) {
            console.error("Sign in error:", error);
            
            let errorMsg = "Failed to sign in";
            if (typeof error === 'object' && error !== null && 'message' in error) {
              errorMsg = (error as any).message;
            }
            
            setErrorMessage(errorMsg);
          }
        } catch (signInError) {
          console.error("Unexpected sign in error:", signInError);
          setErrorMessage("An unexpected error occurred during sign in");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkAndReportSupabaseHealth = async () => {
    setIsCheckingHealth(true);
    const health = await checkSupabaseHealth();
    setSupabaseStatus(health);
    setIsCheckingHealth(false);
    
    toast({
      title: health.isHealthy ? "Connection is healthy" : "Connection issue detected",
      description: health.isHealthy 
        ? "Successfully connected to the database."
        : `Connection issue: ${health.error || "Unknown error"}`,
      variant: health.isHealthy ? "default" : "destructive",
    });
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
            
            {supabaseStatus && !supabaseStatus.isHealthy && (
              <Alert variant="destructive" className="bg-amber-50 text-amber-900 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-amber-800">
                  Connection issue detected. Try clearing session data below.
                </AlertDescription>
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
            
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs flex items-center gap-1"
                onClick={clearLocalAuthData}
              >
                <RefreshCw className="h-3 w-3" /> Clear Session Data
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs flex items-center gap-1"
                onClick={checkAndReportSupabaseHealth}
                disabled={isCheckingHealth}
              >
                {isCheckingHealth ? <Loader2 className="h-3 w-3 animate-spin" /> : <Info className="h-3 w-3" />} 
                Check Connection
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
