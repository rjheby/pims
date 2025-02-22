
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [date, setDate] = useState<Date>();
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring">("one-time");
  const [recurringDay, setRecurringDay] = useState<string>();

  const renderScheduleCell = () => (
    <div className="flex items-center space-x-2">
      <Select value={scheduleType} onValueChange={(value: "one-time" | "recurring") => setScheduleType(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Schedule type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="one-time">One-time</SelectItem>
          <SelectItem value="recurring">Recurring</SelectItem>
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
            <SelectItem value="monday">Every Monday</SelectItem>
            <SelectItem value="tuesday">Every Tuesday</SelectItem>
            <SelectItem value="wednesday">Every Wednesday</SelectItem>
            <SelectItem value="thursday">Every Thursday</SelectItem>
            <SelectItem value="friday">Every Friday</SelectItem>
            <SelectItem value="saturday">Every Saturday</SelectItem>
            <SelectItem value="sunday">Every Sunday</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
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
