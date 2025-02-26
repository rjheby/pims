
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OrderCard } from "./OrderCard";

interface OrderListProps {
  orders: any[];
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
}

export function OrderList({ orders, onEdit, onDuplicate, onDownload, onCopyLink, onShare }: OrderListProps) {
  const { toast } = useToast();

  const handleEdit = async (orderId: string) => {
    // Navigate to edit page
    window.location.href = `/wholesale-order-form/${orderId}`;
  };

  const handleDuplicate = async (order: any) => {
    try {
      // Remove id to create new order
      const { id, created_at, ...orderData } = order;
      
      const { data, error } = await supabase
        .from('wholesale_orders')
        .insert([orderData])
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Order Duplicated",
        description: "The order has been duplicated successfully.",
      });

      // Refresh the page to show the new order
      window.location.reload();
    } catch (error) {
      console.error('Error duplicating order:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (order: any) => {
    try {
      // For now, we'll just trigger the Zapier webhook
      const webhookUrl = prompt("Please enter your Zapier webhook URL for downloading orders:");
      
      if (!webhookUrl) {
        toast({
          title: "Cancelled",
          description: "Download cancelled - no webhook URL provided.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          action: "download",
          order: order,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Download Initiated",
        description: "The download request has been sent to your integration.",
      });
    } catch (error) {
      console.error('Error downloading order:', error);
      toast({
        title: "Error",
        description: "Failed to download the order. Please check your webhook URL and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = (orderId: string) => {
    const url = `${window.location.origin}/wholesale-order-form/${orderId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Order link has been copied to clipboard.",
    });
  };

  const handleShare = async (orderId: string, method: 'email' | 'sms') => {
    try {
      // For now, we'll just trigger the Zapier webhook
      const webhookUrl = prompt(`Please enter your Zapier webhook URL for ${method} sharing:`);
      
      if (!webhookUrl) {
        toast({
          title: "Cancelled",
          description: `${method.toUpperCase()} share cancelled - no webhook URL provided.`,
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          action: "share",
          method: method,
          orderId: orderId,
          orderUrl: `${window.location.origin}/wholesale-order-form/${orderId}`,
          timestamp: new Date().toISOString(),
        }),
      });

      toast({
        title: "Share Initiated",
        description: `The ${method.toUpperCase()} share request has been sent to your integration.`,
      });
    } catch (error) {
      console.error('Error sharing order:', error);
      toast({
        title: "Error",
        description: `Failed to share the order via ${method.toUpperCase()}. Please check your webhook URL and try again.`,
        variant: "destructive",
      });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supplier orders found. Create your first order to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onEdit={() => handleEdit(order.id)}
          onDuplicate={() => handleDuplicate(order)}
          onDownload={() => handleDownload(order)}
          onCopyLink={() => handleCopyLink(order.id)}
          onShare={(method) => handleShare(order.id, method)}
        />
      ))}
    </div>
  );
}
