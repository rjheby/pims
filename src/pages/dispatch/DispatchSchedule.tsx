
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function DispatchSchedule() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch Schedule</h1>
        <Link to="/dispatch/new">
          <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No scheduled deliveries found. Create a new schedule to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}
