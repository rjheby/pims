
import { TableCell, TableRow } from "@/components/ui/table";
import { OrderItem, DropdownOptions } from "../types";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { OrderTableActions } from "./OrderTableActions";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface OrderTableRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  generateItemName: (item: OrderItem) => string;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
}

export function OrderTableRow({
  item,
  options,
  isAdmin,
  editingField,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onRemoveRow,
  onCopyRow,
  generateItemName,
  onUpdateOptions,
}: OrderTableRowProps) {
  const [isCompressed, setIsCompressed] = useState(false);

  return (
    <TableRow>
      <TableCell className="w-full md:w-1/4 min-w-[200px] text-base md:text-sm">
        {generateItemName(item) || (
          <div className="h-6 bg-muted/20 rounded animate-pulse" />
        )}
      </TableCell>
      {!isCompressed && (Object.keys(options) as Array<keyof DropdownOptions>).map((field) => (
        <TableCell key={field} className="min-w-[120px] md:min-w-[160px]">
          <OrderTableDropdownCell
            field={field}
            item={item}
            options={options}
            isAdmin={isAdmin}
            editingField={editingField}
            newOption={newOption}
            onNewOptionChange={onNewOptionChange}
            onKeyPress={onKeyPress}
            onUpdateItem={onUpdateItem}
            onUpdateOptions={onUpdateOptions}
          />
        </TableCell>
      ))}
      {!isCompressed && (
        <TableCell>
          <Input
            type="number"
            min="0"
            value={item.quantity || ""}
            onChange={(e) => onUpdateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
            className="w-24"
            placeholder="Qty"
          />
        </TableCell>
      )}
      <TableCell>
        <OrderTableActions
          item={item}
          onRemoveRow={onRemoveRow}
          onCopyRow={onCopyRow}
          onUpdateItem={onUpdateItem}
        />
      </TableCell>
    </TableRow>
  );
}
