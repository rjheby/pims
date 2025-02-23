
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItem, DropdownOptions } from "./types";
import { OrderTableRow } from "./components/OrderTableRow";
import { KeyboardEvent } from "react";

interface OrderTableProps {
  items: OrderItem[];
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onEditField: (field: keyof DropdownOptions | null) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  generateItemName: (item: OrderItem) => string;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
}

export function OrderTable({
  items,
  options,
  isAdmin,
  editingField,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onEditField,
  onUpdateItem,
  onRemoveRow,
  onCopyRow,
  generateItemName,
  onUpdateOptions,
}: OrderTableProps) {
  return (
    <div className="grid gap-4">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Name</TableHead>
              {Object.keys(options).map((field) => (
                <TableHead key={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <OrderTableRow
                key={item.id}
                item={item}
                options={options}
                isAdmin={isAdmin}
                editingField={editingField}
                newOption={newOption}
                onNewOptionChange={onNewOptionChange}
                onKeyPress={onKeyPress}
                onUpdateItem={onUpdateItem}
                onRemoveRow={onRemoveRow}
                onCopyRow={onCopyRow}
                generateItemName={generateItemName}
                onUpdateOptions={onUpdateOptions}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid gap-4 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border p-4 space-y-3">
            <div className="font-medium">{generateItemName(item) || "New Item"}</div>
            <div className="grid gap-2">
              {Object.entries(options).map(([field, fieldOptions]) => (
                <div key={field} className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </div>
                  <div className="text-sm">
                    {item[field as keyof OrderItem] || "-"}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => onRemoveRow(item.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => onCopyRow(item)}
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
  );
}
