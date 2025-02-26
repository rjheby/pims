import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Pencil, Copy, Download, Link2, Send } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SupplierOrderArchive() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("id, order_number, order_date, delivery_date, items")
          .order('delivery_date', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleEditOrder = (orderId: string) => {
    navigate(`/supplier-order/${orderId}`);
  };

  const handleDuplicateOrder = async (order: any) => {
    try {
      const { id, created_at, order_number, order_date, delivery_date, ...orderData } = order;
      
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      
      const { data: newOrder, error } = await supabase
        .from("wholesale_orders")
        .insert([{
          ...orderData,
          order_date: formattedToday,
          delivery_date: null
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order duplicated",
        description: "The order has been duplicated successfully.",
      });

      navigate(`/supplier-order/${newOrder.id}`);
    } catch (error) {
      console.error("Error duplicating order:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the order.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadOrder = (order: any) => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.order_number}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleCopyLink = (orderId: string) => {
    const link = `${window.location.origin}/supplier-order-form/${orderId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The order link has been copied to your clipboard.",
    });
  };

  const handleShare = (orderId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/supplier-order-form/${orderId}`;
    
    if (method === 'email') {
      window.location.href = `mailto:?subject=Supplier Order&body=View the order here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the order here: ${link}`;
    }
  };

  const processedOrders = orders.map((order: any) => ({
    ...order,
    formattedDeliveryDate: new Date(order.delivery_date).toLocaleDateString(),
    items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
    totalPallets: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
      .reduce((sum: number, item: any) => sum + (Number(item.pallets) || 0), 0),
    totalValue: (typeof order.items === 'string' ? JSON.parse(order.items) : order.items)
      .reduce((sum: number, item: any) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0)
  }));

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto px-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
                alt="Logo"
                className="h-8 md:h-12 w-auto"
              />
            </div>
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Orders Archive</CardTitle>
              <Link to="/supplier-order">
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
              </div>
            ) : processedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processedOrders.map((order: any) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-[#2A4131] mt-1" />
                      <div className="flex-1">
                        <div className="font-medium">Order #{order.order_number}</div>
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
                            <span className="font-medium">${order.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
                                  onClick={() => handleEditOrder(order.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit order</TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 w-8 p-0"
                                    >
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
                                  <AlertDialogAction onClick={() => handleDuplicateOrder(order)}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDownloadOrder(order)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download order</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleCopyLink(order.id)}
                                >
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
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 w-8 p-0"
                                      >
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>Send order</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <PopoverContent className="w-40 p-2">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleShare(order.id, 'email')}
                                  >
                                    Send via Email
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => handleShare(order.id, 'sms')}
                                  >
                                    Send via SMS
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No supplier orders found. Create your first order to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
