
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/layouts/AppLayout";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { AdminControls } from "./wholesale-order/AdminControls";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider, useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { useWindowEvents } from "./wholesale-order/hooks/useWindowEvents";

function WholesaleOrderContent() {
  const { 
    orderNumber, 
    isAdmin, 
    hasUnsavedChanges,
    items,
    options,
    editingField,
    newOption,
    setNewOption,
    orderDate,
    deliveryDate,
    saveChanges,
    discardChanges,
    undoLastChange,
    handleOrderDateChange,
    setDeliveryDate,
    setEditingField,
    optionsHistory,
    setIsAdmin
  } = useWholesaleOrder();

  useWindowEvents();

  const handleAdminToggle = () => {
    if (isAdmin && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save them before exiting admin mode?')) {
        saveChanges();
      } else {
        discardChanges();
      }
    } else {
      setIsAdmin(!isAdmin);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof typeof options) => {
    if (e.key === 'Enter' && newOption.trim()) {
      if (!options[field].includes(newOption.trim())) {
        const updatedOptions = {
          ...options,
          [field]: [...options[field], newOption.trim()],
        };
        setOptions(updatedOptions);
        setHasUnsavedChanges(true);
        setNewOption("");
        toast({
          title: "Option added",
          description: `Added "${newOption}" to ${field}`,
        });
      }
    }
  };

  const generateItemName = (item: OrderItem) => {
    if (!item.length || !item.species || !item.thickness) return "";
    const lengthPrefix = item.length === "12\"" ? "12\" " : "16\" ";
    return `${item.thickness} ${item.bundleType} ${lengthPrefix}${item.species}`;
  };

  return (
    <AppLayout isAdminMode={isAdmin}>
      <div className="container py-4 md:py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            {orderNumber ? `New Wholesale Order ${orderNumber}` : 'New Wholesale Order'}
          </h1>
          <AdminControls 
            isAdmin={isAdmin}
            hasUnsavedChanges={hasUnsavedChanges}
            onSave={saveChanges}
            onDiscard={discardChanges}
            onUndo={undoLastChange}
            onToggleAdmin={handleAdminToggle}
            canUndo={optionsHistory.length > 1}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>New Wholesale Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div id="order-content">
              <OrderDetails 
                orderNumber={orderNumber}
                orderDate={orderDate}
                deliveryDate={deliveryDate}
                onOrderDateChange={handleOrderDateChange}
                onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
              />

              <div className="overflow-x-auto mt-4">
                <OrderTable 
                  items={items}
                  options={options}
                  isAdmin={isAdmin}
                  editingField={editingField}
                  newOption={newOption}
                  onNewOptionChange={setNewOption}
                  onKeyPress={handleKeyPress}
                  onEditField={setEditingField}
                  onUpdateItem={updateItem}
                  onRemoveRow={removeRow}
                  onCopyRow={copyRow}
                  generateItemName={generateItemName}
                />
              </div>

              <OrderActions />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <WholesaleOrderContent />
    </WholesaleOrderProvider>
  );
}
