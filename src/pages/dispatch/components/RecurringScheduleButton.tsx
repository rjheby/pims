
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecurringScheduleButtonProps {
  count: number;
  onClick: () => void;
  variant?: 'default' | 'warning';
}

export const RecurringScheduleButton: React.FC<RecurringScheduleButtonProps> = ({
  count,
  onClick,
  variant = 'default'
}) => {
  const isMobile = useIsMobile();
  const isWarning = variant === 'warning';
  
  // Different styling based on variant
  const buttonClasses = isWarning
    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-green-50 hover:bg-green-100 text-green-800 border-green-300';
    
  const iconComponent = isWarning 
    ? <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
    : <CalendarClock className="mr-2 h-4 w-4 text-green-600" />;

  return (
    <Button
      variant="outline"
      size={isMobile ? "sm" : "default"}
      onClick={onClick}
      className={buttonClasses}
    >
      {iconComponent}
      {isMobile ? (
        <>
          <Badge variant={isWarning ? "outline" : "secondary"} className="ml-1">
            {count}
          </Badge>
        </>
      ) : (
        <>
          Recurring Orders
          <Badge variant={isWarning ? "outline" : "secondary"} className="ml-2">
            {count}
          </Badge>
        </>
      )}
    </Button>
  );
};
