
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Get the return URL from location state or query params
  const getReturnUrl = () => {
    // Check if there's a returnUrl in query params
    const searchParams = new URLSearchParams(location.search);
    const queryReturnUrl = searchParams.get('returnUrl');
    
    // Check if there's a from path in location state
    const stateFrom = location.state?.from;
    
    // Prioritize query param, then state, then default to home
    return queryReturnUrl || stateFrom || '/';
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setIsCheckingSession(false);
          return;
        }
        
        if (data.session) {
          // User is already logged in, redirect to appropriate page
          const returnUrl = getReturnUrl();
          console.log("User is logged in, redirecting to:", returnUrl);
          navigate(returnUrl);
        } else {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsCheckingSession(false);
      }
    }
    
    checkSession();
  }, [navigate, location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Set session duration to 7 days (in seconds)
            // This will be used when the user verifies their email
            data: {
              session_duration: 604800
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            // Set long session duration (7 days) if rememberMe is true
            // This applies to the current session being created
            data: rememberMe ? { session_duration: 604800 } : undefined
          }
        });
        
        if (error) throw error;
        
        const returnUrl = getReturnUrl();
        console.log("Sign in successful, redirecting to:", returnUrl);
        
        // Store remember me preference
        try {
          localStorage.setItem('woodbourne-keep-signed-in', rememberMe ? 'true' : 'false');
        } catch (e) {
          console.warn("Could not save session preference", e);
        }
        
        navigate(returnUrl);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{isSignUp ? "Create an Account" : "Sign In"}</h1>
          <p className="mt-2 text-gray-600">
            {isSignUp
              ? "Create your account to get started"
              : "Sign in to your account to continue"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
            
            {!isSignUp && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>{isSignUp ? "Create Account" : "Sign In"}</>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
