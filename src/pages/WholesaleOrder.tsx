
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { AdminControls } from "./wholesale-order/AdminControls";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderActions } from "./wholesale-order/components/OrderActions";
import { WholesaleOrderProvider, useWholesaleOrder } from "./wholesale-order/context/WholesaleOrderContext";
import { useWindowEvents } from "./wholesale-order/hooks/useWindowEvents";
import { useToast } from "@/hooks/use-toast";
import { OrderItem, DropdownOptions } from "./wholesale-order/types";
import { useAdmin } from "@/context/AdminContext";

function WholesaleOrderContent() {
  const { toast } = useToast();
  const { isAdmin, hasUnsavedChanges, handleAdminToggle, setHasUnsavedChanges } = useAdmin();
  const { 
    orderNumber, 
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
    setOptions,
    setItems
  } = useWholesaleOrder();

  useWindowEvents();

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

  const handleUpdateOptions = (field: keyof DropdownOptions, newOptions: string[]) => {
    setOptions({
      ...options,
      [field]: newOptions
    });
    setHasUnsavedChanges(true);
    toast({
      title: "Options updated",
      description: `Updated options for ${field}`,
    });
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
    <div className="flex-1 min-h-screen overflow-hidden">
      <div className="max-w-[95rem] mx-auto p-2.5">
        <Card className="shadow-sm">
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
                onToggleAdmin={() => handleAdminToggle({
                  onSave: saveChanges,
                  onDiscard: discardChanges
                })}
                canUndo={optionsHistory.length > 1}
              />
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

              <div className="w-full overflow-x-auto md:overflow-x-visible">
                <div className="min-w-full inline-block align-middle">
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
                    onUpdateOptions={handleUpdateOptions}
                  />
                </div>
              </div>

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
