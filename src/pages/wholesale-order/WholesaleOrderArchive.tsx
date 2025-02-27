import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderList } from "./components/OrderList";
import { useOrders } from "./hooks/useOrders";

export function SupplierOrderArchive() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  const handleEditOrder = (orderId: string) => {
    console.log("Navigating to edit order:", orderId);
    navigate(`/wholesale-orders/${orderId}`, { replace: true });
  };

  const handleDuplicateOrder = async (order: any) => {
    try {
      const { id, created_at, order_number, ...orderData } = order;
      const today = new Date().toISOString();
      
      const { data: newOrder, error } = await supabase
        .from("wholesale_orders")
        .insert([{
          ...orderData,
          order_date: today,
          delivery_date: null,
          order_number: `${order_number}-COPY`
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newOrder) throw new Error("Failed to create new order");

      toast({
        title: "Order duplicated",
        description: "The order has been duplicated successfully."
      });

      navigate(`/wholesale-orders/${newOrder.id}`, { replace: true });
    } catch (error) {
      console.error("Error duplicating order:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the order.",
        variant: "destructive"
      });
    }
  };

  const generateOrderPDF = (order: any) => {
    return JSON.stringify(order, null, 2);
  };

  const handleDownloadOrder = (order: any) => {
    try {
      const pdfContent = generateOrderPDF(order);
      const blob = new Blob([pdfContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order-${order.order_number}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading order:", error);
      toast({
        title: "Error",
        description: "Failed to download the order.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (orderId: string) => {
    const link = `${window.location.origin}/wholesale-orders/${orderId}/view`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The order view link has been copied to your clipboard."
    });
  };

  const handleShare = (orderId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/wholesale-orders/${orderId}/view`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Supplier Order&body=View the order here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the order here: ${link}`;
    }
  };

  return (
    <div className="flex-1 w-full">
      <div className="w-full mx-auto px-2 md:px-4">
        <Card className="shadow-sm w-full">
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-4">
              <div>
                <CardTitle>Supplier Orders Archive</CardTitle>
              </div>
              <div>
                <Link to="/wholesale-order">
                  <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    New Order
                  </Button>
                </Link>
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
                <OrderList
                  orders={orders}
                  onEdit={handleEditOrder}
                  onDuplicate={handleDuplicateOrder}
                  onDownload={handleDownloadOrder}
                  onCopyLink={handleCopyLink}
                  onShare={handleShare}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
