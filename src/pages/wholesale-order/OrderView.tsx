
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { renderOrderPDFInIframe, generateOrderPDF } from "./utils/pdfGenerator";
import { OrderItem } from "./types";
import { useToast } from "@/components/ui/use-toast";

export function OrderView() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Parse items if they're stored as a string
        if (data) {
          if (typeof data.items === 'string') {
            data.items = JSON.parse(data.items);
          }
          setOrderData(data);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, toast]);

  useEffect(() => {
    if (orderData && iframeRef.current) {
      // Calculate totals from items
      const parsedItems = orderData.items || [];
      
      // Calculate totalPallets and totalValue from items
      const totalPallets = parsedItems.reduce(
        (sum: number, item: OrderItem) => sum + (Number(item.pallets) || 0), 
        0
      );
      
      const totalValue = parsedItems.reduce(
        (sum: number, item: OrderItem) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 
        0
      );
      
      // Render the PDF in the iframe
      renderOrderPDFInIframe({
        order_number: orderData.order_number || orderData.id?.substring(0, 8),
        order_date: orderData.order_date || orderData.created_at,
        delivery_date: orderData.delivery_date,
        items: parsedItems,
        totalPallets,
        totalValue,
        customer: orderData.customer_id, // Using customer_id as customer name
        notes: orderData.notes,
        status: orderData.status
      }, iframeRef.current);
    }
  }, [orderData]);

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!orderData) return;
    
    try {
      // Calculate totals from items
      const parsedItems = orderData.items || [];
      
      // Calculate totalPallets and totalValue from items
      const totalPallets = parsedItems.reduce(
        (sum: number, item: OrderItem) => sum + (Number(item.pallets) || 0), 
        0
      );
      
      const totalValue = parsedItems.reduce(
        (sum: number, item: OrderItem) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 
        0
      );
      
      const pdf = generateOrderPDF({
        order_number: orderData.order_number || orderData.id?.substring(0, 8),
        order_date: orderData.order_date || orderData.created_at,
        delivery_date: orderData.delivery_date,
        items: parsedItems,
        totalPallets,
        totalValue,
        customer: orderData.customer_id, // Using customer_id as customer name
        notes: orderData.notes,
        status: orderData.status
      });
      
      const fileName = `order-${orderData.order_number || orderData.id?.substring(0, 8)}.pdf`;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Order #{orderData.order_number || orderData.id?.substring(0, 8)}</h1>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="default" className="bg-[#2A4131] hover:bg-[#2A4131]/90">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <iframe 
            ref={iframeRef}
            title="Order PDF View"
            className="w-full h-full min-h-[80vh] border-0"
          />
        </CardContent>
      </Card>
    </div>
  );
}
