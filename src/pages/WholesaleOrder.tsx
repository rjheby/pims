
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

  return (
    <div className="flex-1">
      <div className="w-full max-w-[95rem] mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>New Wholesale Order</CardTitle>
                <CardDescription>Create and manage wholesale orders</CardDescription>
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
