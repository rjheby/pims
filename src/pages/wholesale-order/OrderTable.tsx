
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItem, DropdownOptions, initialOptions } from "./types";
import { OrderTableRow } from "./components/OrderTableRow";
import { useWholesaleOrder } from "./context/WholesaleOrderContext";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function OrderTable() {
  const { 
    items = [], 
    options = initialOptions,
    isAdmin = false, 
    editingField, 
    newOption = "", 
    setNewOption, 
    setEditingField,
    setItems,
    setOptions 
  } = useWholesaleOrder();

  const safeOptions: DropdownOptions = {
    ...initialOptions,
    ...options
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => {
    if (e.key === "Enter" && newOption?.trim()) {
      const updatedOptions = [...(safeOptions[field] || []), newOption.trim()];
      setOptions({
        ...safeOptions,
        [field]: updatedOptions,
      });
      setNewOption("");
      setEditingField(null);
    }
  };

  const handleUpdateItem = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveRow = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCopyRow = (item: OrderItem) => {
    const maxId = Math.max(...items.map((item) => item.id), 0);
    setItems([...items, { ...item, id: maxId + 1 }]);
  };

  const handleAddItem = () => {
    const maxId = Math.max(...items.map((item) => item.id), 0);
    setItems([
      ...items,
      {
        id: maxId + 1,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        packaging: "Pallets",
        pallets: 0,
        quantity: 0,
      },
    ]);
  };

  const generateItemName = (item: OrderItem) => {
    if (!item) return "New Item";
    const parts = [];
    if (item.species) parts.push(item.species);
    if (item.length) parts.push(item.length);
    if (item.bundleType) parts.push(item.bundleType);
    if (item.thickness) parts.push(item.thickness);
    return parts.join(" - ") || "New Item";
  };

  const handleUpdateOptions = (field: keyof DropdownOptions, newOptions: string[]) => {
    setOptions({
      ...safeOptions,
      [field]: newOptions,
    });
  };

  const optionFields = Object.keys(safeOptions) as Array<keyof DropdownOptions>;

  return (
    <div className="grid gap-4">
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Name</TableHead>
              {optionFields.map((field) => (
                <TableHead key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </TableHead>
              ))}
              <TableHead>Quantity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <OrderTableRow
                key={item.id}
                item={item}
                options={safeOptions}
                isAdmin={isAdmin}
                editingField={editingField}
                newOption={newOption}
                onNewOptionChange={setNewOption}
                onKeyPress={handleKeyPress}
                onUpdateItem={handleUpdateItem}
                onRemoveRow={handleRemoveRow}
                onCopyRow={handleCopyRow}
                generateItemName={generateItemName}
                onUpdateOptions={handleUpdateOptions}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        <Button
          onClick={handleAddItem}
          className="w-full mb-4 bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Item
        </Button>
        
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border p-4 space-y-3">
              <div className="font-medium">{generateItemName(item)}</div>
              <div className="grid gap-2">
                {optionFields.map((field) => (
                  <div key={field} className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </div>
                    <div className="text-sm">
                      {item[field as keyof OrderItem] || "-"}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Quantity:</div>
                  <div className="text-sm">{item.quantity || "-"}</div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleRemoveRow(item.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => handleCopyRow(item)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
