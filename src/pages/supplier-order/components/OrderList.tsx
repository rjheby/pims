
import { OrderCard } from "./OrderCard";

interface OrderListProps {
  orders: any[];
  onEdit: (orderId: string) => void;
  onDuplicate: (order: any) => void;
  onDownload: (order: any) => void;
  onCopyLink: (orderId: string) => void;
  onShare: (orderId: string, method: 'email' | 'sms') => void;
}

export function OrderList({ orders, onEdit, onDuplicate, onDownload, onCopyLink, onShare }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No supplier orders found. Create your first order to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDownload={onDownload}
          onCopyLink={onCopyLink}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
