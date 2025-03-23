
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { DispatchScheduleManager } from "./dispatch/components/DispatchScheduleManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DispatchArchive() {
  const [activeTab, setActiveTab] = useState<"all" | "recurring">("all");
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    navigate('/dispatch-creator');
  };
  
  const handleCreateRecurring = () => {
    navigate('/recurring-orders');
  };
  
  return (
    <AuthGuard>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dispatch Archive</h1>
            <p className="text-muted-foreground">View and manage all dispatch schedules</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCreateRecurring} variant="outline" className="hidden md:flex">
              <Calendar className="mr-2 h-4 w-4" />
              Recurring Orders
            </Button>
            <Button onClick={handleCreateNew} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">All Schedules</CardTitle>
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as "all" | "recurring")}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Schedules</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "all" ? (
              <DispatchScheduleManager showFilters={true} />
            ) : (
              <div className="py-4">
                <Button 
                  onClick={handleCreateRecurring} 
                  className="bg-[#2A4131] hover:bg-[#2A4131]/90 mb-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Recurring Order
                </Button>
                
                <p className="text-center text-muted-foreground py-8">
                  Please use the Recurring Orders page to manage recurring deliveries.
                </p>
                
                <div className="flex justify-center">
                  <Button 
                    variant="secondary" 
                    className="mt-4" 
                    onClick={handleCreateRecurring}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Go to Recurring Orders
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
