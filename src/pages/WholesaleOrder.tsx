
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AppLayout from "@/components/layouts/AppLayout";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { AdminControls } from "./wholesale-order/AdminControls";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider, useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { useWindowEvents } from "./wholesale-order/hooks/useWindowEvents";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "./wholesale-order/types";
import { useState } from "react";

function WholesaleOrderContent() {
  const { toast } = useToast();
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
    setIsAdmin,
    setOptions,
    setHasUnsavedChanges,
    setItems
  } = useWholesaleOrder();

  useWindowEvents();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const updateItem = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeRow = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const copyRow = (itemToCopy: OrderItem) => {
    const newItem = {
      ...itemToCopy,
      id: Math.max(...items.map(item => item.id)) + 1,
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>New Wholesale Order {orderNumber}</CardTitle>
              <CardDescription>
                Create and manage wholesale orders
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <div id="order-content" className="space-y-6">
            <OrderDetails 
              orderNumber={orderNumber}
              orderDate={orderDate}
              deliveryDate={deliveryDate}
              onOrderDateChange={handleOrderDateChange}
              onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
            />

            <div className="overflow-x-auto">
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
  );
}

export default function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <AppLayout>
        <WholesaleOrderContent />
      </AppLayout>
    </WholesaleOrderProvider>
  );
}
