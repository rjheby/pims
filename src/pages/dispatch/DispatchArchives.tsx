
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderList } from "../wholesale-order/components/OrderList";
import { useOrders } from "../wholesale-order/hooks/useOrders";

export function DispatchArchives() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  const handleEditOrder = (orderId: string) => {
    console.log("Navigating to edit schedule:", orderId);
    navigate(`/dispatch/archives/${orderId}`, { replace: true });
  };

  const handleDuplicateOrder = async (order: any) => {
    try {
      const { id, created_at, order_number, status, submitted_at, ...orderData } = order;
      const today = new Date().toISOString();
      
      const { data: newOrder, error } = await supabase
        .from("wholesale_orders")
        .insert([{
          ...orderData,
          order_date: today,
          delivery_date: null,
          order_number: `${order_number}-COPY`,
          status: 'draft'
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newOrder) throw new Error("Failed to create new schedule");

      toast({
        title: "Schedule duplicated",
        description: "The schedule has been duplicated successfully."
      });

      navigate(`/dispatch/archives/${newOrder.id}`, { replace: true });
    } catch (error) {
      console.error("Error duplicating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the schedule.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadOrder = (order: any) => {
    try {
      const pdfContent = JSON.stringify(order, null, 2);
      const blob = new Blob([pdfContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-${order.order_number}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading schedule:", error);
      toast({
        title: "Error",
        description: "Failed to download the schedule.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (orderId: string, method: 'email' | 'sms') => {
    const link = `${window.location.origin}/dispatch/archives/${orderId}/view`;
    if (method === 'email') {
      window.location.href = `mailto:?subject=Delivery Schedule&body=View the schedule here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the schedule here: ${link}`;
    }
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <div>
              <CardTitle>Dispatch Archives</CardTitle>
            </div>
            <div>
              <Link to="/dispatch/schedule">
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Schedule
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
                onShare={handleShare}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
