
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecurringOrder {
  id: string;
  customer_id: string;
  frequency: string;
  preferred_day?: string;
  preferred_time?: string;
  created_at: string;
  updated_at: string;
  active_status?: boolean;
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteOrder(itemToDelete);
      setItemToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

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
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{order.customer?.name || "Unknown Customer"}</div>
                      {order.active_status !== false ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatFrequency(order.frequency)}</div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Preferred Day:
                      </span>
                      <span>{formatDay(order.preferred_day)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Preferred Time:
                      </span>
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
                      className="text-blue-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteClick(order.id)}
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
                <TableHead>Status</TableHead>
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
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    {orders.length === 0 ? "No recurring orders found" : "No orders match your search criteria"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {order.active_status !== false ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{order.customer?.name || "Unknown Customer"}</TableCell>
                    <TableCell>{formatFrequency(order.frequency)}</TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDay(order.preferred_day)}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatTime(order.preferred_time)}
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEditOrder(order)}
                          className="text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(order.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring order? This action cannot be undone,
              and will remove all future occurrences of this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
