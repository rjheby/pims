
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { Link } from "react-router-dom";
import { Archive } from "lucide-react";

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
    <div className="flex-1">
      <div className="w-full mx-auto px-4 max-w-full">
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
                <Link 
                  to="/wholesale-orders" 
                  className="flex items-center gap-2 text-[#FDE1D3] hover:text-[#FDE1D3]/80 transition-colors"
                >
                  <Archive className="h-5 w-5" />
                  <span>View All Orders</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <WholesaleOrderContent />
    </WholesaleOrderProvider>
  );
}
