
import { createRoot } from 'react-dom/client'
import { StrictMode, useEffect, useState } from 'react'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './pages/dispatch/components/stops/ErrorBoundary'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

// Custom component to handle initial connection diagnostics
function AppWithDiagnostics() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Test basic Supabase connection on initial load
    const testConnection = async () => {
      try {
        console.log("Testing initial Supabase connection...");
        const { error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Initial connection test failed:", error);
          setHasConnectionError(true);
          setErrorDetails(error.message);
        } else {
          console.log("Initial connection test successful");
          setHasConnectionError(false);
        }
      } catch (err: any) {
        console.error("Exception in initial connection test:", err);
        setHasConnectionError(true);
        setErrorDetails(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    testConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-gray-500">Checking connection...</p>
      </div>
    );
  }

  if (hasConnectionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Connection Error</h2>
          <p className="text-gray-700 mb-4">
            Unable to connect to the database. This might be due to:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>Network connectivity issues</li>
            <li>Database service unavailability</li>
            <li>Authentication token expiration</li>
          </ul>
          <div className="bg-white p-3 rounded border border-red-200 mb-4 overflow-auto">
            <pre className="text-sm text-red-800 whitespace-pre-wrap">
              {errorDetails || "Unknown error"}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    createRoot(rootElement).render(<AppWithDiagnostics />);
  } catch (error) {
    console.error("Error rendering application:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Application Error</h2>
        <p>Sorry, there was an error loading the application. Please try refreshing the page.</p>
        <pre style="text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px;">${error}</pre>
      </div>
    `;
  }
}
