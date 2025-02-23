
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
}: OrderTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Name</TableHead>
          {Object.keys(options).map((field) => (
            <TableHead key={field}>
              <div className="flex items-center justify-between">
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
              </div>
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
          />
        ))}
      </TableBody>
    </Table>
  );
}
