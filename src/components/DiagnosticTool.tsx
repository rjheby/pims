
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useDiagnosticTool } from "@/pages/dispatch/hooks/useDiagnosticTool";

interface DiagnosticToolProps {
  className?: string;
}

export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({ className }) => {
  const { runDiagnostics, isRunning, results, hasErrors } = useDiagnosticTool();
  const [showDetails, setShowDetails] = useState(false);

  const handleRunDiagnostics = () => {
    runDiagnostics();
    setShowDetails(true);
  };

  return (
    <div className={className}>
      <Button 
        onClick={handleRunDiagnostics} 
        variant="outline"
        disabled={isRunning}
        className="mb-2"
      >
        {isRunning ? (
          <>
            <span className="animate-spin mr-2">⌛</span>
            Running System Diagnostics...
          </>
        ) : (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            System Diagnostics
          </>
        )}
      </Button>
      
      {showDetails && Object.keys(results).length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-md font-medium">Diagnostic Results</h3>
          
          {Object.entries(results).map(([test, result]: [string, any]) => (
            <Alert 
              key={test} 
              variant={result.success ? "default" : "destructive"}
              className="p-3"
            >
              <div className="flex items-start">
                {result.success ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                )}
                <div>
                  <AlertTitle className="text-sm font-medium">
                    {result.success ? "Passed: " : "Failed: "}
                    {test.replace(/([A-Z])/g, ' $1').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase())}
                    {result.time && ` (${result.time}ms)`}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {result.message}
                    {result.count !== undefined && (
                      <div className="mt-1">Records found: {result.count}</div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
          
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              Hide Details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
