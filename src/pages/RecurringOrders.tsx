
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { RecurringOrderManager } from "./dispatch/components/RecurringOrderManager";

export default function RecurringOrders() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/dispatch-archive');
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Recurring Orders</h1>
            </div>
            <p className="text-muted-foreground ml-10">Create and manage recurring delivery schedules</p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Recurring Delivery Schedules
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RecurringOrderManager />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
