
import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CapacityWarningProps {
  utilization: number;
  driverName?: string;
  className?: string;
}

export const CapacityWarning: React.FC<CapacityWarningProps> = ({ 
  utilization, 
  driverName,
  className = '' 
}) => {
  // Determine warning level based on capacity utilization
  const getWarningLevel = () => {
    if (utilization > 95) return 'critical';
    if (utilization > 85) return 'warning';
    if (utilization > 70) return 'notice';
    return 'good';
  };

  const level = getWarningLevel();
  const subject = driverName ? `Driver ${driverName}'s` : 'Schedule';

  // Define alert appearance based on level
  const alertStyles = {
    critical: {
      variant: 'destructive',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Overcapacity',
      description: `${subject} capacity is at ${utilization}% - exceeding recommended limits.`
    },
    warning: {
      variant: 'warning',
      icon: <AlertTriangle className="h-4 w-4" />,
      title: 'Near Capacity',
      description: `${subject} is approaching capacity limits at ${utilization}%.`
    },
    notice: {
      variant: 'default',
      icon: <Info className="h-4 w-4" />,
      title: 'Capacity Notice',
      description: `${subject} is at ${utilization}% capacity.`
    },
    good: {
      variant: 'success',
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'Optimal Capacity',
      description: `${subject} is at an optimal ${utilization}% capacity.`
    }
  };

  const currentStyle = alertStyles[level];

  return (
    <Alert 
      variant={currentStyle.variant as any} 
      className={`flex items-center ${className}`}
    >
      {currentStyle.icon}
      <div className="ml-2">
        <AlertTitle>{currentStyle.title}</AlertTitle>
        <AlertDescription>
          {currentStyle.description}
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default CapacityWarning;
