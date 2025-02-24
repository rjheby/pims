
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { Leaf } from "lucide-react";

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
    orderNumber && `Order #${orderNumber}`,
    orderDate && `Order Date: ${formatDate(orderDate)}`,
    deliveryDate && `Delivery: ${formatDate(deliveryDate)}`
  ].filter(Boolean).join(' • ');

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto">
        {/* Logo/Icon Section */}
        <div className="flex justify-center md:justify-start mb-4">
          <div className="hidden md:block">
            <img 
              src="/woodbourne-logo.png" 
              alt="Woodbourne Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="md:hidden flex items-center">
            <Leaf className="h-8 w-8 text-[#2A4131]" />
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>New Wholesale Order</CardTitle>
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
              <OrderTable />
              <OrderActions />
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
