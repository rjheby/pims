
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createRecurringOrderFromSchedule } from '../utils/recurringOrderUtils';
import { RecurringOrderForm, RecurrenceData } from './stops/RecurringOrderForm';

interface ConvertToRecurringFormProps {
  scheduleId: string;
  scheduleName: string;
  customerName: string;
  onComplete: () => void;
}

export function ConvertToRecurringForm({ 
  scheduleId, 
  scheduleName,
  customerName,
  onComplete 
}: ConvertToRecurringFormProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>({
    isRecurring: true,
    frequency: 'weekly',
  });
  const { toast } = useToast();
  
  const handleConvert = async () => {
    if (!recurrenceData.frequency || !recurrenceData.preferredDay) {
      toast({
        title: "Missing information",
        description: "Please select frequency and preferred day",
        variant: "destructive"
      });
      return;
    }
    
    setIsConverting(true);
    
    try {
      await createRecurringOrderFromSchedule(
        scheduleId,
        {
          frequency: recurrenceData.frequency,
          preferredDay: recurrenceData.preferredDay,
          preferredTime: recurrenceData.startDate, // Using string directly
          startDate: recurrenceData.startDate ? new Date(recurrenceData.startDate) : undefined, // Convert string to Date
          endDate: recurrenceData.endDate ? new Date(recurrenceData.endDate) : undefined // Convert string to Date
        },
        toast
      );
      
      onComplete();
    } finally {
      setIsConverting(false);
    }
  };
  
  return (
    <Card className="mt-4 border-green-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-md flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Convert to Recurring Schedule
            </CardTitle>
            <CardDescription>
              Make {scheduleName} for {customerName} a recurring delivery
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <RecurringOrderForm
          recurrenceData={recurrenceData}
          onRecurrenceChange={setRecurrenceData}
        />
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleConvert}
            disabled={isConverting || !recurrenceData.preferredDay}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Convert to Recurring
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
