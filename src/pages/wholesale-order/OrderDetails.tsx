
import { Input } from "@/components/ui/input";

interface OrderDetailsProps {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  onOrderDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeliveryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function OrderDetails({
  orderNumber,
  orderDate,
  deliveryDate,
  onOrderDateChange,
  onDeliveryDateChange,
}: OrderDetailsProps) {
  // Format today's date as YYYY-MM-DD for the input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <label htmlFor="orderNumber" className="text-sm font-medium">Order #</label>
        <Input
          id="orderNumber"
          value={orderNumber}
          readOnly
          className="bg-gray-50"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="orderDate" className="text-sm font-medium">Order Date</label>
        <Input
          id="orderDate"
          type="date"
          value={orderDate || today}
          onChange={onOrderDateChange}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="deliveryDate" className="text-sm font-medium">Delivery Date</label>
        <Input
          id="deliveryDate"
          type="date"
          value={deliveryDate}
          onChange={onDeliveryDateChange}
        />
      </div>
    </div>
  );
}
