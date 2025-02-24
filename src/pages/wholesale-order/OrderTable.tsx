
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { OrderItem, DropdownOptions, initialOptions } from "./types";
import { OrderTableRow } from "./components/OrderTableRow";
import { useWholesaleOrder } from "./context/WholesaleOrderContext";
import { Button } from "@/components/ui/button";
import { Plus, Copy, X, Maximize2, Minimize2 } from "lucide-react";
import { OrderTableDropdownCell } from "./components/OrderTableDropdownCell";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

  const [compressedStates, setCompressedStates] = useState<Record<number, boolean>>({});

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

    if (item.quantity && item.packaging) {
      parts.push(`${item.quantity} ${item.packaging} of`);
    }

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

  const toggleCompressed = (itemId: number) => {
    setCompressedStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const optionFields = Object.keys(safeOptions) as Array<keyof DropdownOptions>;

  return (
    <div className="grid gap-4 overflow-x-auto">
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  {optionFields.map((field) => (
                    <TableHead key={field} className="w-[160px]">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {generateItemName(item)}
                    </TableCell>
                    {!compressedStates[item.id] && optionFields.map((field) => (
                      <TableCell key={field}>
                        <OrderTableDropdownCell
                          field={field}
                          item={item}
                          options={safeOptions}
                          isAdmin={isAdmin}
                          editingField={editingField}
                          newOption={newOption}
                          onNewOptionChange={setNewOption}
                          onKeyPress={handleKeyPress}
                          onUpdateItem={handleUpdateItem}
                          onUpdateOptions={handleUpdateOptions}
                        />
                      </TableCell>
                    ))}
                    {!compressedStates[item.id] && (
                      <TableCell>
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                          className="w-24"
                          placeholder="Qty"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Button 
                          variant="customAction"
                          size="sm" 
                          onClick={() => handleRemoveRow(item.id)} 
                          className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="customAction"
                          size="sm" 
                          onClick={() => handleCopyRow(item)} 
                          className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="customAction"
                          size="sm" 
                          onClick={handleAddItem} 
                          className="rounded-full w-8 h-8 p-0 bg-[#2A4131] hover:bg-slate-50 text-slate-50 hover:text-[#2A4131]"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="customAction"
                          size="sm" 
                          onClick={() => toggleCompressed(item.id)} 
                          className="rounded-full w-8 h-8 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black"
                        >
                          {compressedStates[item.id] ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
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
              {!compressedStates[item.id] && (
                <div className="grid gap-4">
                  {optionFields.map((field) => (
                    <div key={field} className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </div>
                      <OrderTableDropdownCell
                        field={field}
                        item={item}
                        options={safeOptions}
                        isAdmin={isAdmin}
                        editingField={editingField}
                        newOption={newOption}
                        onNewOptionChange={setNewOption}
                        onKeyPress={handleKeyPress}
                        onUpdateItem={handleUpdateItem}
                        onUpdateOptions={handleUpdateOptions}
                      />
                    </div>
                  ))}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Quantity
                    </div>
                    <Input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      className="w-full"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-center pt-2 border-t">
                <Button 
                  variant="customAction"
                  size="sm" 
                  onClick={() => handleRemoveRow(item.id)} 
                  className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  variant="customAction"
                  size="sm" 
                  onClick={() => handleCopyRow(item)} 
                  className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="customAction"
                  size="sm" 
                  onClick={handleAddItem} 
                  className="rounded-full w-8 h-8 p-0 bg-[#2A4131] hover:bg-slate-50 text-slate-50 hover:text-[#2A4131]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  variant="customAction"
                  size="sm" 
                  onClick={() => toggleCompressed(item.id)} 
                  className="rounded-full w-8 h-8 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black"
                >
                  {compressedStates[item.id] ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
