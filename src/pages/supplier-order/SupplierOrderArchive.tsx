
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
    navigate(`/wholesale-order-form/${orderId}`);
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
        description: "The order has been duplicated successfully."
      });

      navigate(`/wholesale-order-form/${newOrder.id}`);
    } catch (error) {
      console.error("Error duplicating order:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the order.",
        variant: "destructive"
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
    const link = `${window.location.origin}/wholesale-order-form/${orderId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The order link has been copied to your clipboard."
    });
  };

  const handleShare = (orderId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/wholesale-order-form/${orderId}`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Supplier Order&body=View the order here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the order here: ${link}`;
    }
  };

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto px-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-center">
              <img src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png" alt="Logo" className="h-8 md:h-12 w-auto" />
            </div>
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Orders Archive</CardTitle>
              <Link to="/wholesale-order">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
