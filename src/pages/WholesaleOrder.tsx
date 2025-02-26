
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { Link } from "react-router-dom";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

function WholesaleOrderContent() {
  const { 
    orderNumber, 
    orderDate, 
    deliveryDate, 
    handleOrderDateChange,
    setDeliveryDate 
  } = useWholesaleOrder();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const headerDetails = [
    orderDate && `Order Date: ${formatDate(orderDate)}`,
    deliveryDate && `Delivery: ${formatDate(deliveryDate)}`
  ].filter(Boolean).join(' • ');

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>{orderNumber ? `Wholesale Order #${orderNumber}` : 'New Wholesale Order'}</CardTitle>
            {headerDetails && (
              <CardDescription className="mt-1">
                {headerDetails}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <OrderDetails 
            orderNumber={orderNumber}
            orderDate={orderDate}
            deliveryDate={deliveryDate}
            onOrderDateChange={handleOrderDateChange}
            onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
          />
          <div className="overflow-x-auto">
            <OrderTable />
          </div>
          <OrderActions />
          
          {/* Archive Link */}
          <div className="flex justify-center pt-6 border-t">
            <Button
              asChild
              className="bg-[#f1e8c7] text-[#222222] hover:bg-[#f1e8c7]/90"
            >
              <Link to="/wholesale-orders" className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                <span>View All Orders</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <WholesaleOrderContent />
    </WholesaleOrderProvider>
  );
}
