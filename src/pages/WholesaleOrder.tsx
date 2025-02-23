
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { AdminControls } from "./wholesale-order/AdminControls";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider, useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { useWindowEvents } from "./wholesale-order/hooks/useWindowEvents";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "./wholesale-order/types";
import { cn } from "@/lib/utils";

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
    <WholesaleOrderProvider>
      <div className="relative min-h-screen">
        {/* Admin Mode Overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-red-500 bg-opacity-10 transition-opacity duration-500 pointer-events-none",
            isAdmin ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Animated Admin Mode Indicator */}
        {isAdmin && (
          <div className="fixed top-2 right-4 z-50 animate-pulse text-sm px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg">
            Admin Mode Active
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6 px-4 md:px-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>New Wholesale Order {orderNumber}</CardTitle>
                  <CardDescription>Create and manage wholesale orders</CardDescription>
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
      </div>
    </WholesaleOrderProvider>
  );
}

export default function WholesaleOrder() {
  return (
    <WholesaleOrderProvider>
      <WholesaleOrderContent />
    </WholesaleOrderProvider>
  );
}
