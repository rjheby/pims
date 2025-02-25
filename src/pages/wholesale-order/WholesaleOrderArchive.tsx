
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, Mail } from "lucide-react";

export function WholesaleOrderArchive() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setOrders(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Calculate total pallets and order value for each order
  const processedOrders = orders.map(order => {
    let items = [];
    try {
      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items || [];
    } catch (e) {
      console.error("Error parsing items:", e);
    }
    
    const totalPallets = items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
    const totalValue = items.reduce((sum, item) => {
      return sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0));
    }, 0);
    
    return {
      ...order,
      totalPallets,
      totalValue,
      formattedDeliveryDate: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'No delivery date set'
    };
  });

  const handleDownload = async (orderId: string) => {
    // TODO: Implement PDF generation and download
    console.log('Download order:', orderId);
  };

  const handleEmail = async (orderId: string) => {
    // TODO: Implement email sending
    console.log('Email order:', orderId);
  };

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto px-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
                alt="Woodbourne Logo"
                className="h-8 md:h-12 w-auto"
              />
            </div>
            <div className="flex justify-between items-center">
              <CardTitle>Wholesale Orders Archive</CardTitle>
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
            ) : processedOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {processedOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-[#2A4131] mt-1" />
                      <div className="flex-1">
                        <Link to={`/wholesale-order-form/${order.id}`}>
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
                        </Link>
                        <div className="mt-3 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownload(order.id)}
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEmail(order.id)}
                          >
                            <Mail className="mr-1 h-4 w-4" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No wholesale orders found. Create your first order to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
