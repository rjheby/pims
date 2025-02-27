import { FileText, Pencil, Copy, Download, Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { generateOrderPDF } from "../utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

interface OrderCardProps {
  order: {
    id: string;
    order_number: string;
    formattedDeliveryDate: string;
    totalPallets: number;
    totalValue: number;
    status?: string;
    submitted_at?: string;
  };
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink?: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
}

export function OrderCard({ order, onEdit, onDuplicate, onDownload, onCopyLink, onShare }: OrderCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isSubmitted = order.status === 'submitted';

  const handleDownload = async (order: any) => {
    try {
      const doc = generateOrderPDF(order);
      doc.save(`order-${order.order_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (orderId: string) => {
    if (onCopyLink) {
      onCopyLink(orderId);
      return;
    }
    
    const url = `${window.location.origin}/wholesale-orders/view/${orderId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Link copied to clipboard",
    });
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="p-2 align-top w-[50px]">
              <FileText className="h-[50px] w-[50px] text-[#2A4131]" />
            </td>
            <td className="align-top">
              <div className="flex justify-between items-start">
                <div className="font-medium">Order #{order.order_number}</div>
                {isSubmitted && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Submitted
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Delivery Date: </span>
                {order.formattedDeliveryDate}
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Total Pallets:</span>
                  <span className="font-medium">{order.totalPallets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Value:</span>
                  <span className="font-medium">${order.totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => navigate(`/wholesale-orders/${order.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isSubmitted ? 'Edit submitted order' : 'Edit order'}
                    </TooltipContent>
                  </Tooltip>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate order</TooltipContent>
                      </Tooltip>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Duplicate Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create a new order with the same items. The order date will be set to today and you'll need to set a new delivery date.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDuplicate(order)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleDownload(order)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleCopyLink(order.id)}>
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>

                  <Popover>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Send className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Send order</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <PopoverContent className="w-40 p-2">
                      <div className="flex flex-col gap-2">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => onShare(order.id, 'email')}>
                          Send via Email
                        </Button>
                        <Button variant="ghost" className="w-full justify-start" onClick={() => onShare(order.id, 'sms')}>
                          Send via SMS
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipProvider>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
