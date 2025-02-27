
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { DispatchList } from "./components/DispatchList";

// Mock data for initial development - completed/archived dispatches
const mockArchivedDispatches = [
  {
    id: "4",
    clientName: "Wilson Family",
    phoneNumber: "555-222-3333",
    stopNumber: 1,
    driver: "Michael Smith",
    items: "3 Cords Mixed Hardwood",
    revenue: 780,
    cogs: 480, 
    address: "456 Elm St, Springfield, IL",
    notes: "Customer has a dog",
    status: "completed",
    scheduledDate: "2025-02-28"
  },
  {
    id: "5",
    clientName: "Thompson Restaurant",
    phoneNumber: "555-444-5555",
    stopNumber: 2,
    driver: "Sarah Jones",
    items: "5 Cords Oak",
    revenue: 1500,
    cogs: 900,
    address: "200 Restaurant Row, Springfield, IL",
    notes: "Delivery to back entrance",
    status: "completed",
    scheduledDate: "2025-02-25"
  }
];

export function DispatchArchive() {
  const navigate = useNavigate();
  const [archivedDispatches, setArchivedDispatches] = useState(mockArchivedDispatches);
  const [loading, setLoading] = useState(false);

  const handleEditDispatch = (dispatchId: string) => {
    console.log("Navigating to view archived dispatch:", dispatchId);
    navigate(`/dispatch/archive/${dispatchId}`, { replace: true });
  };

  const handleDuplicateDispatch = (dispatch: any) => {
    console.log("Duplicating archived dispatch:", dispatch);
    // Implementation would copy this to the active schedule
    navigate("/dispatch/schedule");
  };

  const handleShareDispatch = (dispatchId: string, method: 'email' | 'sms') => {
    console.log("Sharing archived dispatch:", dispatchId, "via", method);
    const link = `${window.location.origin}/dispatch/view/${dispatchId}`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Dispatch Record&body=View the dispatch details here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the dispatch details here: ${link}`;
    }
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>Dispatch Archives</CardTitle>
            </div>
            <div className="flex justify-between">
              <Link to="/dispatch/schedule">
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button variant="outline">
                  Last Week
                </Button>
                <Button variant="outline">
                  Last Month
                </Button>
                <Button variant="outline">
                  All Time
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
                dispatches={archivedDispatches}
                onEdit={handleEditDispatch}
                onDuplicate={handleDuplicateDispatch}
                onShare={handleShareDispatch}
                archived={true}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
