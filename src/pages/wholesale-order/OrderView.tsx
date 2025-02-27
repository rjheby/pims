
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { generateOrderPDF } from "./utils/pdfGenerator";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "./utils";

export function OrderView() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        if (error) {
          throw error;
        }

        // Parse items if they're stored as a string
        if (data && typeof data.items === 'string') {
          data.items = JSON.parse(data.items);
        }

        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Could not load the order details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  const handleDownload = () => {
    if (!order) return;
    
    try {
      const pdf = generateOrderPDF({
        order_number: order.order_number || order.id?.substring(0, 8),
        order_date: order.order_date || order.created_at,
        delivery_date: order.delivery_date,
        items: order.items || [],
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

  // Calculate totals
  const totalPallets = order?.items?.reduce(
    (sum: number, item: any) => sum + (Number(item.pallets) || 0), 
    0
  ) || 0;
  
  const totalValue = order?.items?.reduce(
    (sum: number, item: any) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 
    0
  ) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-4">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-center mb-8">The order you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-md">
        <CardHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                Order #{order.order_number || order.id?.substring(0, 8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDate(order.created_at || order.order_date)}
              </p>
            </div>
            {order.status && (
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Details</h3>
              
              {order.customer && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customer}</p>
                </div>
              )}
              
              {order.delivery_date && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">Delivery Date</p>
                  <p>{formatDate(order.delivery_date)}</p>
                </div>
              )}
              
              {order.notes && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <div className="bg-muted p-3 rounded-md text-sm">{order.notes}</div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span>{totalPallets} {totalPallets === 1 ? 'pallet' : 'pallets'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Order Value:</span>
                  <span className="font-bold">{formatCurrency(totalValue)}</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button onClick={handleDownload} size="lg" className="w-full">
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 border">Item</th>
                    <th className="text-left p-3 border">Description</th>
                    <th className="text-center p-3 border">Quantity</th>
                    <th className="text-right p-3 border">Unit Cost</th>
                    <th className="text-right p-3 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any, index: number) => {
                    const itemName = [
                      item.species,
                      item.length,
                      item.bundleType,
                      item.thickness,
                      item.packaging
                    ].filter(Boolean).join(' - ');
                    
                    const description = [
                      item.species && `Species: ${item.species}`,
                      item.length && `Length: ${item.length}`,
                      item.bundleType && `Bundle Type: ${item.bundleType}`,
                      item.thickness && `Thickness: ${item.thickness}`,
                      item.packaging && `Packaging: ${item.packaging}`
                    ].filter(Boolean).join(', ');
                    
                    const totalCost = (item.pallets || 0) * (item.unitCost || 0);
                    
                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                        <td className="p-3 border">{itemName || 'Unnamed Item'}</td>
                        <td className="p-3 border text-sm text-muted-foreground">{description}</td>
                        <td className="p-3 border text-center">{item.pallets || 0}</td>
                        <td className="p-3 border text-right">{formatCurrency(item.unitCost || 0)}</td>
                        <td className="p-3 border text-right font-medium">{formatCurrency(totalCost)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-[#2A4131]/10 font-bold">
                    <td colSpan={2} className="p-3 border">Total</td>
                    <td className="p-3 border text-center">{totalPallets}</td>
                    <td className="p-3 border"></td>
                    <td className="p-3 border text-right">{formatCurrency(totalValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
