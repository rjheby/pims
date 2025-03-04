
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Customer } from "./customers/types";
import { supabase } from "@/integrations/supabase/client";

export default function DispatchDelivery() {
  const [date, setDate] = useState<Date>();
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring" | "bi-weekly">("one-time");
  const [recurringDay, setRecurringDay] = useState<string>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch customers from the database
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .order('name');

        if (error) {
          console.error("Error fetching customers:", error);
          return;
        }
        
        setCustomers(data as Customer[] || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  // Find the selected customer by ID
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const renderClientCell = () => (
    <div className="flex items-center space-x-2">
      <Select value={selectedCustomerId || ""} onValueChange={setSelectedCustomerId}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select a customer" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dispatch & Delivery Schedule</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Track and manage deliveries, drivers, and order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
                  <TableCell className="font-medium">{renderClientCell()}</TableCell>
                  <TableCell>{selectedCustomer?.phone || '-'}</TableCell>
                  <TableCell>{renderScheduleCell()}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{selectedCustomer?.address || '-'}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
