
import { useState, useEffect } from "react";
import { DispatchScheduleContent } from "./dispatch/components/DispatchScheduleContent";
import { DispatchScheduleProvider } from "./dispatch/context/DispatchScheduleContext";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";

export default function DispatchSchedule() {
  const { toast } = useToast();
  
  useEffect(() => {
    // Remind users about unscheduled orders workflow
    const hasSeenInfo = localStorage.getItem('hasSeenUnscheduledInfo');
    
    if (!hasSeenInfo) {
      toast({
        title: "New Feature: Unscheduled Orders",
        description: "You can now view unscheduled orders and add them to your schedule. Check the 'Unscheduled Orders' tab.",
        duration: 6000,
      });
      
      localStorage.setItem('hasSeenUnscheduledInfo', 'true');
    }
  }, [toast]);
  
  return (
    <AuthGuard requiredRole="driver">
      <DispatchScheduleProvider>
        <DispatchScheduleContent />
      </DispatchScheduleProvider>
    </AuthGuard>
  );
}
