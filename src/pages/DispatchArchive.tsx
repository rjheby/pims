
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { DispatchScheduleManager } from "./dispatch/components/DispatchScheduleManager";

export default function DispatchArchive() {
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate('/dispatch-creator');
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dispatch Archive</h1>
            <p className="text-muted-foreground">View and manage all dispatch schedules</p>
          </div>
          
          <Button onClick={handleCreateNew} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">All Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <DispatchScheduleManager showFilters={true} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
