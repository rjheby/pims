
import { formatCurrency, formatDate } from "../utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Download, Copy, Share, MoreHorizontal, Phone, Mail, Link, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

interface OrderCardProps {
  order: any;
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
  onDelete: (orderId: string) => void;
  searchTerm?: string;
}

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
}

export function OrderCard({ 
  order, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onCopyLink, 
  onShare, 
  onDelete,
  searchTerm = "" 
}: OrderCardProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalPrice = order.items?.reduce(
    (sum: number, item: any) => sum + (item.pallets || 0) * (item.unitCost || 0),
    0
  ) || order.totalPrice || 0;

  const totalPallets = order.items?.reduce(
    (sum: number, item: any) => sum + (Number(item.pallets) || 0),
    0
  ) || order.totalPallets || 0;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {searchTerm ? 
                highlightText(`Order #${order.order_number || order.id?.substring(0, 8)}`, searchTerm) :
                `Order #${order.order_number || order.id?.substring(0, 8)}`
              }
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 
                highlightText(formatDate(order.created_at || order.order_date), searchTerm) :
                formatDate(order.created_at || order.order_date)
              }
            </CardDescription>
          </div>
          {order.status && (
            <Badge variant={getStatusBadgeVariant(order.status)}>
              {searchTerm ? 
                highlightText(order.status, searchTerm) :
                order.status
              }
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <div className="space-y-2">
          {order.customer && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Customer:</span>
              <span>
                {searchTerm ? 
                  highlightText(order.customer, searchTerm) :
                  order.customer
                }
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground mr-2">Total:</span>
              <span className="font-medium">{formatCurrency(totalPrice)}</span>
            </div>
            <div>
              <span className="text-muted-foreground mr-2">Items:</span>
              <span>{totalPallets} {totalPallets === 1 ? 'pallet' : 'pallets'}</span>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground block mb-1">Notes:</span>
              <div className="bg-muted p-2 rounded text-xs">
                {searchTerm ? 
                  highlightText(order.notes, searchTerm) :
                  order.notes
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit(order.id)}
        >
          <Edit className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onDownload(order)}
        >
          <Download className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Download</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onCopyLink(order.id)}
        >
          <Link className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Link</span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete order #{order.order_number || order.id?.substring(0, 8)}?
                This action cannot be undone. All order data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(order.id)}
              >
                Yes, Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-grow-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate(order)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(order.id, 'email')}>
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(order.id, 'sms')}>
              <Phone className="mr-2 h-4 w-4" />
              Share via SMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
