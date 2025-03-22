
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";

const NotFound = () => {
  const location = useLocation();
  const { goBack } = useNavigation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Map of common mistyped routes to their correct paths
  const suggestedRoutes = {
    "/profile": "/profile",
    "/recurring-orders": "/recurring-orders",
    "/driver-management": "/driver-management",
    "/drivers-management": "/driver-management",
    "/driver-manage": "/driver-management",
    "/drivers": "/drivers",
    "/settings": "/team-settings"
  };

  // Check if the current path is close to any known routes
  const getSuggestion = () => {
    const currentPath = location.pathname.toLowerCase();
    
    // Direct match in our suggestions
    if (suggestedRoutes[currentPath]) {
      return suggestedRoutes[currentPath];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(suggestedRoutes)) {
      if (currentPath.includes(key.slice(1)) || key.slice(1).includes(currentPath.slice(1))) {
        return value;
      }
    }
    
    return null;
  };

  const suggestedRoute = getSuggestion();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-red-600">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        
        <p className="text-gray-500 mb-4">
          The page at <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{location.pathname}</span> could not be found.
        </p>
        
        {suggestedRoute && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md text-left">
            <p className="text-blue-700 font-medium">Did you mean to visit:</p>
            <Link to={suggestedRoute} className="text-blue-600 hover:underline block mt-2">
              {suggestedRoute}
            </Link>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={goBack} 
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button asChild className="flex items-center justify-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
