
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WholesaleOrderProvider, WholesaleOrderQueryProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { BaseOrderActions } from "@/components/templates/BaseOrderActions";
import { WholesaleOrderSummary } from "./wholesale-order/components/WholesaleOrderSummary";
import { useWholesaleOrderForm } from "./wholesale-order/hooks/useWholesaleOrderForm";

export function WholesaleOrderForm() {
  const {
    orderData,
    orderStatus,
    loading,
    error,
    isSaving,
    isSubmitting,
    handleOrderDateChange,
    handleDeliveryDateChange,
    handleOrderItemsChange,
    handleSave,
    handleSubmit
  } = useWholesaleOrderForm();

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (!orderData) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-500">Order not found</div>
    </div>
  );

  const isSubmitted = orderStatus === 'submitted';
  const actionLabel = isSubmitted ? "Update Submitted Order" : "Submit Order";

  return (
    <div className="flex-1">
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Order #{orderData?.order_number}</CardTitle>
              {isSubmitted && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BaseOrderDetails
                orderNumber={orderData.order_number}
                orderDate={orderData.order_date}
                deliveryDate={orderData.delivery_date}
                onOrderDateChange={handleOrderDateChange}
                onDeliveryDateChange={handleDeliveryDateChange}
                disabled={false}
              />
              
              <WholesaleOrderQueryProvider>
                <WholesaleOrderProvider initialItems={orderData.items}>
                  <OrderTable 
                    readOnly={false}
                    onItemsChange={handleOrderItemsChange} 
                  />
                </WholesaleOrderProvider>
              </WholesaleOrderQueryProvider>

              <WholesaleOrderSummary items={orderData.items} />

              <BaseOrderActions
                onSave={handleSave}
                onSubmit={handleSubmit}
                submitLabel={actionLabel}
                archiveLink="/wholesale-orders"
                isSaving={isSaving}
                isSubmitting={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
