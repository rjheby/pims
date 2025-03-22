
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

    const diagnosticResults: DiagnosticResults = {};
    let hasIssues = false;
    
    try {
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
        
        if (error) hasIssues = true;
        console.log(`Connection test: ${!error ? 'Success' : 'Failed'} (${connectionTime}ms)`);
      } catch (err: any) {
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
        
        if (error || !session) hasIssues = true;
      } catch (err: any) {
        hasIssues = true;
        diagnosticResults.authentication = {
          success: false,
          message: `Authentication test failed: ${err.message}`,
          error: err
        };
      }

      // 3. Test drivers table
      try {
        console.log("Testing drivers table...");
        const driversStart = performance.now();
        const { data, error, count } = await supabase
          .from("drivers")
          .select('*', { count: 'exact' })
          .limit(1);
        const driversTime = Math.round(performance.now() - driversStart);
        
        diagnosticResults.driversTable = {
          success: !error,
          time: driversTime,
          count: count ?? 0,
          message: error ? error.message : `Found ${count} drivers (${driversTime}ms)`,
          error: error || null
        };
        
        if (error) hasIssues = true;
      } catch (err: any) {
        hasIssues = true;
        diagnosticResults.driversTable = {
          success: false,
          message: `Drivers table test failed: ${err.message}`,
          error: err
        };
      }

      // 4. Test recurring orders table
      try {
        console.log("Testing recurring_orders table...");
        const ordersStart = performance.now();
        const { data, error, count } = await supabase
          .from("recurring_orders")
          .select('*', { count: 'exact' })
          .limit(1);
        const ordersTime = Math.round(performance.now() - ordersStart);
        
        diagnosticResults.recurringOrdersTable = {
          success: !error,
          time: ordersTime,
          count: count ?? 0,
          message: error ? error.message : `Found ${count} recurring orders (${ordersTime}ms)`,
          error: error || null
        };
        
        if (error) hasIssues = true;
      } catch (err: any) {
        hasIssues = true;
        diagnosticResults.recurringOrdersTable = {
          success: false,
          message: `Recurring orders table test failed: ${err.message}`,
          error: err
        };
      }

      // 5. Test profiles table
      try {
        console.log("Testing profiles table...");
        const profileStart = performance.now();
        const { data, error, count } = await supabase
          .from("profiles")
          .select('*', { count: 'exact' })
          .limit(5);
        const profileTime = Math.round(performance.now() - profileStart);
        
        diagnosticResults.profilesTable = {
          success: !error,
          time: profileTime,
          count: count ?? 0,
          message: error ? error.message : `Found ${count} profiles (${profileTime}ms)`,
          error: error || null
        };
        
        if (error) hasIssues = true;
      } catch (err: any) {
        hasIssues = true;
        diagnosticResults.profilesTable = {
          success: false,
          message: `Profiles table test failed: ${err.message}`,
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
