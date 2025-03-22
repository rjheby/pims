
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  preferred_time?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

interface RecurringOrdersTableProps {
  orders: RecurringOrder[];
  onEditOrder: (order: RecurringOrder) => void;
  onDeleteOrder: (id: string) => void;
  formatFrequency: (freq: string) => string;
  formatDay: (day?: string) => string;
  formatTime: (time?: string) => string;
  filteredOrders: RecurringOrder[];
}

export function RecurringOrdersTable({
  orders,
  onEditOrder,
  onDeleteOrder,
  formatFrequency,
  formatDay,
  formatTime,
  filteredOrders
}: RecurringOrdersTableProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      {isMobile ? (
        // Mobile card view
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-6 text-muted-foreground">
                {orders.length === 0 ? "No recurring orders found" : "No orders match your search criteria"}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 bg-muted/30">
                    <div className="font-medium">{order.customer?.name || "Unknown Customer"}</div>
                    <div className="text-sm text-muted-foreground">{formatFrequency(order.frequency)}</div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Preferred Day:</span>
                      <span>{formatDay(order.preferred_day)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Preferred Time:</span>
                      <span>{formatTime(order.preferred_time)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="border-t p-2 flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditOrder(order)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteOrder(order.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Desktop table view
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Preferred Day</TableHead>
                <TableHead>Preferred Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    {orders.length === 0 ? "No recurring orders found" : "No orders match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customer?.name || "Unknown Customer"}</TableCell>
                    <TableCell>{formatFrequency(order.frequency)}</TableCell>
                    <TableCell>{formatDay(order.preferred_day)}</TableCell>
                    <TableCell>{formatTime(order.preferred_time)}</TableCell>
                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEditOrder(order)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
