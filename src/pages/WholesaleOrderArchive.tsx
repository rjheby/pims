import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderList } from "./wholesale-order/components/OrderList";
import { useOrders } from "./wholesale-order/hooks/useOrders";
import { generateOrderPDF, getOrderPdfUrl, renderOrderPDFInIframe } from "./wholesale-order/utils/pdfGenerator";
import { OrderItem } from "./wholesale-order/types";

export function WholesaleOrderArchive() {
  const navigate = useNavigate();
  const { orders, loading, refreshOrders } = useOrders();
  const { toast } = useToast();

  const handleEditOrder = (orderId: string) => {
    console.log("Navigating to edit order:", orderId);
    navigate(`/wholesale-orders/${orderId}`, { replace: true });
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

  const handleDownloadOrder = (order: any) => {
    try {
      // Parse items if they're in string format
      const items = typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items || [];
      
      const pdf = generateOrderPDF({
        order_number: order.order_number || order.id?.substring(0, 8),
        order_date: order.order_date || order.created_at,
        delivery_date: order.delivery_date,
        items: items as OrderItem[],
        totalPallets: order.totalPallets,
        totalValue: order.totalValue,
        customer: order.customer,
        notes: order.notes,
        status: order.status
      });
      
      const fileName = `order-${order.order_number || order.id?.substring(0, 8)}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Success",
        description: "Order PDF downloaded successfully."
      });
    } catch (error) {
      console.error("Error downloading order as PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = async (orderId: string) => {
    try {
      // Get the order data
      const { data: order, error } = await supabase
        .from("wholesale_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
        
      if (error) throw error;
      if (!order) throw new Error("Order not found");
      
      // Create a proper view URL
      const viewUrl = `${window.location.origin}/wholesale-orders/${orderId}/view`;
      
      // Simplified copy approach - use an input element with direct selection
      const tempInput = document.createElement('input');
      document.body.appendChild(tempInput);
      tempInput.value = viewUrl;
      tempInput.select();
      
      // Try to copy using document.execCommand (most reliable across browsers)
      let copySuccess = false;
      try {
        copySuccess = document.execCommand('copy');
      } catch(e) {
        console.error("execCommand failed:", e);
      }
      
      // Clean up the temporary element
      document.body.removeChild(tempInput);
      
      // If execCommand failed, try the Clipboard API
      if (!copySuccess) {
        try {
          await navigator.clipboard.writeText(viewUrl);
          copySuccess = true;
        } catch(e) {
          console.error("Clipboard API failed:", e);
          throw new Error("Could not copy to clipboard");
        }
      }
      
      if (copySuccess) {
        toast({
          title: "Link copied",
          description: "The shareable order link has been copied to your clipboard."
        });
      } else {
        throw new Error("Failed to copy link");
      }
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard. Try selecting and copying the URL manually.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (orderId: string, method: 'email' | 'sms') => {
    // Create a shareable link directly to the view page
    const link = `${window.location.origin}/wholesale-orders/${orderId}/view`;
    
    if (method === 'email') {
      window.location.href = `mailto:?subject=Timber Order Details&body=View the order details here: ${link}`;
    } else if (method === 'sms') {
      window.location.href = `sms:?body=View the timber order details here: ${link}`;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("wholesale_orders")
        .delete()
        .eq("id", orderId);

      if (error) throw error;

      refreshOrders();

      toast({
        title: "Order deleted",
        description: "The order has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
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
                onDelete={handleDeleteOrder}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
