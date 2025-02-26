
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { OrderTable } from "./wholesale-order/OrderTable";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";

function WholesaleOrderContent() {
  const { 
    orderNumber, 
    orderDate, 
    deliveryDate, 
    handleOrderDateChange,
    setDeliveryDate,
    items,
  } = useWholesaleOrder();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const headerDetails = [
    orderDate && `Order Date: ${formatDate(orderDate)}`,
    deliveryDate && `Delivery Date: ${formatDate(deliveryDate)}`
  ].filter(Boolean).join(' • ');

  const calculateTotals = () => {
    const quantityByPackaging = items.reduce((acc, item) => {
      const packaging = item.packaging || 'Unspecified';
      acc[packaging] = (acc[packaging] || 0) + (item.pallets || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalQuantity = Object.values(quantityByPackaging).reduce((sum, qty) => sum + qty, 0);
    const totalValue = items.reduce((sum, item) => sum + ((item.pallets || 0) * (item.unitCost || 0)), 0);

    return {
      quantityByPackaging,
      totalQuantity,
      totalValue,
    };
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>{orderNumber ? `Supplier Order #${orderNumber}` : 'New Supplier Order'}</CardTitle>
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
          <BaseOrderDetails 
            orderNumber={orderNumber}
            orderDate={orderDate}
            deliveryDate={deliveryDate}
            onOrderDateChange={handleOrderDateChange}
            onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
          />
          <OrderTable />
          <BaseOrderSummary items={calculateTotals()} />
          <BaseOrderActions 
            onSave={() => {}} 
            archiveLink="/wholesale-orders"
          />
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
