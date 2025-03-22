
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for diagnosing data loading issues in the dispatch route
 * This hook performs connection tests and provides detailed error information
 */
export function useDispatchDiagnostics() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, any>>({});
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Function to run diagnostic tests
  const runDiagnostics = async () => {
    setIsRunning(true);
    setErrorDetails(null);
    setResults({});

    const diagnosticResults: Record<string, any> = {};
    
    try {
      // 1. Test basic connection to Supabase
      try {
        console.log("Testing basic Supabase connection...");
        const connectionStart = performance.now();
        const { data, error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
        const connectionTime = Math.round(performance.now() - connectionStart);
        
        diagnosticResults.basicConnection = {
          success: !error,
          time: connectionTime,
          message: error ? error.message : `Connection successful (${connectionTime}ms)`,
          error: error ? error : null
        };
        
        console.log(`Basic connection test: ${!error ? 'Success' : 'Failed'} (${connectionTime}ms)`);
      } catch (err: any) {
        diagnosticResults.basicConnection = {
          success: false,
          message: `Connection test threw exception: ${err.message}`,
          error: err
        };
        console.error("Basic connection test exception:", err);
      }

      // 2. Test authentication
      try {
        console.log("Testing authentication status...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        diagnosticResults.authentication = {
          success: !error && !!session,
          message: error ? error.message : (session ? "User authenticated" : "No active session"),
          error: error ? error : null,
          sessionInfo: session ? {
            expires_at: session.expires_at,
            user_id: session.user.id,
            email: session.user.email,
            role: session.user.role
          } : null
        };
        
        console.log(`Authentication test: ${!error && !!session ? 'Success' : 'Failed'}`);
      } catch (err: any) {
        diagnosticResults.authentication = {
          success: false,
          message: `Authentication test threw exception: ${err.message}`,
          error: err
        };
        console.error("Authentication test exception:", err);
      }

      // 3. Test dispatch_schedules access
      try {
        console.log("Testing dispatch_schedules access...");
        const scheduleStart = performance.now();
        const { data, error, count } = await supabase
          .from("dispatch_schedules")
          .select('*', { count: 'exact' })
          .limit(1);
        const scheduleTime = Math.round(performance.now() - scheduleStart);
        
        diagnosticResults.dispatchSchedules = {
          success: !error,
          time: scheduleTime,
          count: count,
          message: error ? error.message : `Found ${count} records (${scheduleTime}ms)`,
          error: error ? error : null,
          sampleData: data && data.length > 0 ? data[0] : null
        };
        
        console.log(`Dispatch schedules test: ${!error ? 'Success' : 'Failed'} (${scheduleTime}ms)`);
      } catch (err: any) {
        diagnosticResults.dispatchSchedules = {
          success: false,
          message: `Dispatch schedules test threw exception: ${err.message}`,
          error: err
        };
        console.error("Dispatch schedules test exception:", err);
      }

      // 4. Test delivery_schedules access
      try {
        console.log("Testing delivery_schedules access...");
        const stopsStart = performance.now();
        const { data, error, count } = await supabase
          .from("delivery_schedules")
          .select('*', { count: 'exact' })
          .limit(1);
        const stopsTime = Math.round(performance.now() - stopsStart);
        
        diagnosticResults.deliverySchedules = {
          success: !error,
          time: stopsTime,
          count: count,
          message: error ? error.message : `Found ${count} records (${stopsTime}ms)`,
          error: error ? error : null,
          sampleData: data && data.length > 0 ? data[0] : null
        };
        
        console.log(`Delivery schedules test: ${!error ? 'Success' : 'Failed'} (${stopsTime}ms)`);
      } catch (err: any) {
        diagnosticResults.deliverySchedules = {
          success: false,
          message: `Delivery schedules test threw exception: ${err.message}`,
          error: err
        };
        console.error("Delivery schedules test exception:", err);
      }

      // 5. Test customers access
      try {
        console.log("Testing customers access...");
        const customersStart = performance.now();
        const { data, error, count } = await supabase
          .from("customers")
          .select('*', { count: 'exact' })
          .limit(1);
        const customersTime = Math.round(performance.now() - customersStart);
        
        diagnosticResults.customers = {
          success: !error,
          time: customersTime,
          count: count,
          message: error ? error.message : `Found ${count} records (${customersTime}ms)`,
          error: error ? error : null,
          sampleData: data && data.length > 0 ? data[0] : null
        };
        
        console.log(`Customers test: ${!error ? 'Success' : 'Failed'} (${customersTime}ms)`);
      } catch (err: any) {
        diagnosticResults.customers = {
          success: false,
          message: `Customers test threw exception: ${err.message}`,
          error: err
        };
        console.error("Customers test exception:", err);
      }

      // Set the results
      setResults(diagnosticResults);
      
      // Analyze results to provide a summary
      const failedTests = Object.entries(diagnosticResults)
        .filter(([_, result]) => !result.success)
        .map(([test, result]) => `${test}: ${result.message}`);
      
      if (failedTests.length > 0) {
        const errorMessage = `Found ${failedTests.length} issues:\n${failedTests.join('\n')}`;
        setErrorDetails(errorMessage);
        console.error(errorMessage);
        
        toast({
          title: "Diagnostic Issues Found",
          description: `${failedTests.length} data loading issues detected. Check console for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Diagnostics Successful",
          description: "All connection tests passed successfully",
        });
      }
    } catch (err: any) {
      console.error("Error running diagnostics:", err);
      setErrorDetails(`Error running diagnostics: ${err.message}`);
      
      toast({
        title: "Diagnostic Error",
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
    errorDetails,
    hasErrors: !!errorDetails
  };
}
