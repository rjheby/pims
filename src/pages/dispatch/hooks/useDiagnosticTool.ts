
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResults {
  [key: string]: {
    success: boolean;
    message: string;
    time?: number;
    count?: number;
    error?: any;
  };
}

export function useDiagnosticTool() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResults>({});
  const [hasErrors, setHasErrors] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults({});
    let hasIssues = false;
    
    try {
      console.log("Starting diagnostic tests...");
      const diagnosticResults: DiagnosticResults = {};
      
      // 1. Test Supabase connection
      try {
        console.log("Testing Supabase connection...");
        const connectionStart = performance.now();
        const { data, error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
        const connectionTime = Math.round(performance.now() - connectionStart);
        
        diagnosticResults.supabaseConnection = {
          success: !error,
          time: connectionTime,
          message: error ? error.message : `Connection successful (${connectionTime}ms)`,
          error: error || null
        };
        
        if (error) {
          console.error("Supabase connection test failed:", error);
          hasIssues = true;
        } else {
          console.log(`Connection test: Success (${connectionTime}ms)`);
        }
      } catch (err: any) {
        console.error("Exception in connection test:", err);
        hasIssues = true;
        diagnosticResults.supabaseConnection = {
          success: false,
          message: `Connection test failed: ${err.message}`,
          error: err
        };
      }

      // 2. Test authentication
      try {
        console.log("Testing authentication...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        diagnosticResults.authentication = {
          success: !error && !!session,
          message: error ? error.message : (session ? "User authenticated successfully" : "No active session found"),
          error: error || null
        };
        
        if (error || !session) {
          console.log("Authentication test:", error ? "Error" : "No session");
          hasIssues = true;
        } else {
          console.log("Authentication test: Success");
        }
      } catch (err: any) {
        console.error("Exception in authentication test:", err);
        hasIssues = true;
        diagnosticResults.authentication = {
          success: false,
          message: `Authentication test failed: ${err.message}`,
          error: err
        };
      }

      // 3. Test database tables access
      // Test wholesale_order_options table specifically since it was causing issues
      try {
        console.log("Testing wholesale_order_options table...");
        const optionsStart = performance.now();
        const { data, error } = await supabase
          .from("wholesale_order_options")
          .select('*')
          .limit(1);
        const optionsTime = Math.round(performance.now() - optionsStart);
        
        diagnosticResults.orderOptionsTable = {
          success: !error,
          time: optionsTime,
          message: error ? error.message : `Options table access successful (${optionsTime}ms)`,
          error: error || null
        };
        
        if (error) {
          console.error("wholesale_order_options table test failed:", error);
          hasIssues = true;
        } else {
          console.log(`wholesale_order_options table test: Success (${optionsTime}ms)`);
        }
      } catch (err: any) {
        console.error("Exception in wholesale_order_options table test:", err);
        hasIssues = true;
        diagnosticResults.orderOptionsTable = {
          success: false,
          message: `wholesale_order_options table test failed: ${err.message}`,
          error: err
        };
      }

      // 4. Test wood_products table
      try {
        console.log("Testing wood_products table...");
        const productsStart = performance.now();
        const { data, error, count } = await supabase
          .from("wood_products")
          .select('*', { count: 'exact' })
          .limit(5);
        const productsTime = Math.round(performance.now() - productsStart);
        
        diagnosticResults.woodProductsTable = {
          success: !error,
          time: productsTime,
          count: count ?? 0,
          message: error ? error.message : `Found ${count} wood products (${productsTime}ms)`,
          error: error || null
        };
        
        if (error) {
          console.error("wood_products table test failed:", error);
          hasIssues = true;
        } else {
          console.log(`wood_products table test: Success, found ${count} records (${productsTime}ms)`);
        }
      } catch (err: any) {
        console.error("Exception in wood_products table test:", err);
        hasIssues = true;
        diagnosticResults.woodProductsTable = {
          success: false,
          message: `wood_products table test failed: ${err.message}`,
          error: err
        };
      }

      // Set final results
      setResults(diagnosticResults);
      setHasErrors(hasIssues);
      
      if (hasIssues) {
        console.error("Diagnostic found issues:", diagnosticResults);
        toast({
          title: "Diagnostic Issues Found",
          description: "Check the diagnostic results for details.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "All Diagnostics Passed",
          description: "No issues found in system diagnostics.",
        });
      }
    } catch (err: any) {
      console.error("Error running diagnostics:", err);
      toast({
        title: "Diagnostics Failed",
        description: `Error running diagnostics: ${err.message}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return {
    runDiagnostics,
    isRunning,
    results,
    hasErrors
  };
}
