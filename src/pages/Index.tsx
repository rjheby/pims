
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, UserPlus, Settings } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  console.log("Index page rendering START");
  const [date, setDate] = useState<Date>();
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring" | "bi-weekly">("one-time");
  const [recurringDay, setRecurringDay] = useState<string>();
  
  // Add error handling around context usage
  const userContext = useUser();
  const { toast } = useToast();
  
  console.log("Index: User context:", userContext);
  
  useEffect(() => {
    console.log("Index page mounted, current user:", userContext.user);
  }, [userContext.user]);

  const handleAddUser = () => {
    toast({
      title: "Coming soon",
      description: "User management functionality will be implemented next",
    });
  };

  const renderScheduleCell = () => (
    <div className="flex items-center space-x-2">
      <Select value={scheduleType} onValueChange={(value: "one-time" | "recurring" | "bi-weekly") => setScheduleType(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Schedule type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one-time">One-time</SelectItem>
          <SelectItem value="recurring">Weekly</SelectItem>
          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
        </SelectContent>
      </Select>

      {scheduleType === "one-time" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Select value={recurringDay} onValueChange={setRecurringDay}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {scheduleType === "recurring" ? (
              <>
                <SelectItem value="monday">Every Monday</SelectItem>
                <SelectItem value="tuesday">Every Tuesday</SelectItem>
                <SelectItem value="wednesday">Every Wednesday</SelectItem>
                <SelectItem value="thursday">Every Thursday</SelectItem>
                <SelectItem value="friday">Every Friday</SelectItem>
                <SelectItem value="saturday">Every Saturday</SelectItem>
                <SelectItem value="sunday">Every Sunday</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="monday-biweekly">Every Other Monday</SelectItem>
                <SelectItem value="tuesday-biweekly">Every Other Tuesday</SelectItem>
                <SelectItem value="wednesday-biweekly">Every Other Wednesday</SelectItem>
                <SelectItem value="thursday-biweekly">Every Other Thursday</SelectItem>
                <SelectItem value="friday-biweekly">Every Other Friday</SelectItem>
                <SelectItem value="saturday-biweekly">Every Other Saturday</SelectItem>
                <SelectItem value="sunday-biweekly">Every Other Sunday</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  // Add render confirmation logging
  console.log("Index page rendering COMPLETE");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Howdy, {userContext.user?.name || 'Guest'}</h1>
          <p className="text-muted-foreground">Role: {userContext.user?.role || 'Not logged in'}</p>
        </div>
        {userContext.hasPermission("superadmin") && (
          <div className="flex gap-2">
            <Button onClick={handleAddUser}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Track and manage deliveries, drivers, and order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Delivery Schedule</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>(555) 123-4567</TableCell>
                  <TableCell>{renderScheduleCell()}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
