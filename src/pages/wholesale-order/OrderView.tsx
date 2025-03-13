
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { renderOrderPDFInIframe, generateOrderPDF } from './utils/pdfGenerator';
import { OrderItem } from './types';

export function OrderView() {
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        if (!orderId) {
          throw new Error('Order ID is missing');
        }

        const { data, error } = await supabase
          .from('wholesale_orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error('Order not found');

        setOrder(data);

        // Parse items if they're in string format
        const items = typeof data.items === 'string' 
          ? JSON.parse(data.items) 
          : data.items || [];

        // Wait for the iframe to be available in the DOM
        setTimeout(() => {
          if (iframeRef.current) {
            renderOrderPDFInIframe({
              order_number: data.order_number || data.id?.substring(0, 8),
              order_date: data.order_date || data.created_at,
              delivery_date: data.delivery_date,
              items: items as OrderItem[],
              totalPallets: data.totalPallets,
              totalValue: data.totalValue,
              customer: data.customer,
              notes: data.notes,
              status: data.status
            }, iframeRef.current);
          }
        }, 100);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.print();
      } catch (error) {
        console.error('Error printing:', error);
        toast({
          title: 'Print Error',
          description: 'Could not print the document. Try downloading it instead.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownload = () => {
    try {
      if (!order) return;
      
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex justify-between items-center">
        <Link to="/wholesale-orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            disabled={loading || !!error}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownload}
            disabled={loading || !!error}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A4131]"></div>
            </div>
          ) : error ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive text-lg">{error}</p>
                <p className="mt-2">Please check the order ID and try again.</p>
              </div>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              className="w-full h-[80vh] border-0"
              title="Order Preview"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
