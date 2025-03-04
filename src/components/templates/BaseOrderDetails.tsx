
import { Input } from "@/components/ui/input";

interface BaseOrderDetailsProps {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  onOrderDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeliveryDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customFields?: React.ReactNode;
  disabled?: boolean;
  hideDateDelivery?: boolean; // Added for dispatch component
  dateLabel?: string; // Added for custom date labels
}

export function BaseOrderDetails({
  orderNumber,
  orderDate,
  deliveryDate,
  onOrderDateChange,
  onDeliveryDateChange,
  customFields,
  disabled = false,
  hideDateDelivery = false,
  dateLabel = "Delivery Date",
}: BaseOrderDetailsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Order Number
        </label>
        <div className="mt-1.5 font-semibold">{orderNumber}</div>
      </div>
      <div>
        <label htmlFor="orderDate" className="text-sm font-medium text-muted-foreground">
          Order Date
        </label>
        <Input
          id="orderDate"
          type="date"
          value={orderDate}
          onChange={onOrderDateChange}
          className="mt-1.5"
          disabled={disabled}
        />
      </div>
      {!hideDateDelivery && (
        <div>
          <label htmlFor="deliveryDate" className="text-sm font-medium text-muted-foreground">
            {dateLabel}
          </label>
          <Input
            id="deliveryDate"
            type="date"
            value={deliveryDate}
            onChange={onDeliveryDateChange}
            className="mt-1.5"
            disabled={disabled}
          />
        </div>
      )}
      {customFields}
    </div>
  );
}
