
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DispatchList } from "./components/DispatchList";

// Mock data for initial development
const mockDispatchItems = [
  {
    id: "1",
    clientName: "Johnson Residence",
    phoneNumber: "555-123-4567",
    stopNumber: 1,
    driver: "Michael Smith",
    items: "2 Cords Mixed Hardwood",
    revenue: 520,
    cogs: 320, 
    address: "123 Oak St, Springfield, IL",
    notes: "Deliver to backyard",
    status: "scheduled",
    scheduledDate: "2025-03-05"
  },
  {
    id: "2",
    clientName: "Springfield Hotel",
    phoneNumber: "555-987-6543",
    stopNumber: 2,
    driver: "Sarah Jones",
    items: "4 Cords Oak",
    revenue: 1200,
    cogs: 800,
    address: "500 Main St, Springfield, IL",
    notes: "Call before delivery",
    status: "completed",
    scheduledDate: "2025-03-04"
  },
  {
    id: "3",
    clientName: "Green Family",
    phoneNumber: "555-456-7890",
    stopNumber: 3,
    driver: "Michael Smith",
    items: "1 Cord Cherry",
    revenue: 350,
    cogs: 200,
    address: "789 Pine Rd, Springfield, IL",
    notes: "",
    status: "scheduled",
    scheduledDate: "2025-03-06"
  }
];

export function DispatchSchedule() {
  const navigate = useNavigate();
  const [dispatchItems, setDispatchItems] = useState(mockDispatchItems);
  const [loading, setLoading] = useState(false);

  const handleEditDispatch = (dispatchId: string) => {
    console.log("Navigating to edit dispatch:", dispatchId);
    navigate(`/dispatch/schedule/${dispatchId}`, { replace: true });
  };

  const handleDuplicateDispatch = (dispatch: any) => {
    console.log("Duplicating dispatch:", dispatch);
    // Implement duplication logic here
    const newDispatch = {
      ...dispatch,
      id: Date.now().toString(),
      status: "scheduled",
      clientName: `${dispatch.clientName} (Copy)`
    };
    
    setDispatchItems([...dispatchItems, newDispatch]);
  };

  const handleShareDispatch = (dispatchId: string, method: 'email' | 'sms') => {
    console.log("Sharing dispatch:", dispatchId, "via", method);
    const link = `${window.location.origin}/dispatch/view/${dispatchId}`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Dispatch Schedule&body=View the dispatch details here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the dispatch details here: ${link}`;
    }
  };

  const handleMarkComplete = (dispatchId: string) => {
    setDispatchItems(
      dispatchItems.map(item => 
        item.id === dispatchId ? { ...item, status: "completed" } : item
      )
    );
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>Dispatch Schedule</CardTitle>
            </div>
            <div className="flex justify-between">
              <Link to="/dispatch/new">
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Dispatch
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline">
                  Today
                </Button>
                <Button variant="outline">
                  This Week
                </Button>
                <Button variant="outline">
                  This Month
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
              </div>
            ) : (
              <DispatchList
                dispatches={dispatchItems}
                onEdit={handleEditDispatch}
                onDuplicate={handleDuplicateDispatch}
                onShare={handleShareDispatch}
                onMarkComplete={handleMarkComplete}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
