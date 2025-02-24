
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";

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
      <div className="w-full max-w-[95rem] mx-auto px-4">
        {/* Logo Section */}
        <div className="flex justify-center md:justify-start mb-4">
          <img 
            src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
            alt="Woodbourne Logo"
            className="h-8 md:h-12 w-auto"
          />
        </div>

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
