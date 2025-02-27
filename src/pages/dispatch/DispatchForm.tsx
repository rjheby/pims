
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DispatchForm() {
  const { id } = useParams();
  const isNewForm = !id;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {isNewForm ? "Create New Schedule" : "Edit Schedule"}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Schedule Date</Label>
                <Input 
                  id="schedule-date" 
                  type="date" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery-date">Delivery Date</Label>
                <Input 
                  id="delivery-date" 
                  type="date"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90" type="submit">
                {isNewForm ? "Create Schedule" : "Update Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
