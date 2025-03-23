
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, RefreshCw, Edit, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateRecurringSchedule } from '../utils/recurringOrderUtils';

interface RecurringOrderDetailsProps {
  schedule: {
    id: string;
    schedule_date: string;
    schedule_number: string;
  };
  recurringInfo: {
    recurring_order_id: string;
    modified_from_template: boolean;
    recurring_orders: {
      id: string;
      frequency: string;
      preferred_day: string;
      preferred_time?: string;
      customers: {
        id: string;
        name: string;
      };
    };
  };
  onRefreshData: () => void;
}

export function RecurringOrderDetails({ 
  schedule, 
  recurringInfo, 
  onRefreshData 
}: RecurringOrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleUpdateRecurringSchedule = async (updateType: 'single' | 'future' | 'all') => {
    setIsUpdating(true);
    
    try {
      // For demonstration, we're just making a simple update. 
      // In a real scenario, you'd prompt for changes first.
      const updates = {
        // Example update - these would come from a form
        notes: `Updated via ${updateType} update on ${new Date().toISOString()}`
      };
      
      const success = await updateRecurringSchedule(
        schedule.id,
        updates,
        updateType,
        toast
      );
      
      if (success) {
        onRefreshData();
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-blue-700">
          <RefreshCw className="h-4 w-4" />
          Recurring Order Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {recurringInfo.recurring_orders.frequency.toUpperCase()}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDay(recurringInfo.recurring_orders.preferred_day)}
            </Badge>
            
            {recurringInfo.recurring_orders.preferred_time && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recurringInfo.recurring_orders.preferred_time}
              </Badge>
            )}
            
            {recurringInfo.modified_from_template && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Modified from template
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            This schedule is part of a recurring series for {recurringInfo.recurring_orders.customers.name}
          </div>
          
          <div className="flex justify-end pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-blue-700"
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isUpdating ? "Updating..." : "Manage Recurring Schedule"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleUpdateRecurringSchedule('single')}>
                  Edit this occurrence only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateRecurringSchedule('future')}>
                  Edit this and future occurrences
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateRecurringSchedule('all')}>
                  Edit all occurrences
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
