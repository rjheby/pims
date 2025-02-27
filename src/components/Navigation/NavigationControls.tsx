
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/hooks/useNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function NavigationControls() {
  const { goBack, goForward } = useNavigation();

  return (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go back</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goForward}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">Go forward</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go forward</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
