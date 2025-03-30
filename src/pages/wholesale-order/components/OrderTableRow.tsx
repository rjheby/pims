
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { OrderItem, DropdownOptions } from "../types";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TableCell } from "@/components/ui/table";

interface OrderTableRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  editingRowId: number | null;
  newOption: string;
  isCompressed: boolean;
  readOnly?: boolean;
  onNewOptionChange: (option: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdateItem: (item: OrderItem) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: (item?: Partial<OrderItem>) => void;
  generateItemName: (item: OrderItem) => string;
  onUpdateOptions: (option: string) => void;
  onStartEditing: (field: keyof DropdownOptions, rowId: number) => void;
  onToggleCompressed: (id: number) => void;
}

export function OrderTableRow({
  item,
  options,
  isAdmin,
  editingField,
  editingRowId,
  newOption,
  isCompressed,
  readOnly = false,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onRemoveRow,
  onCopyRow,
  onAddItem,
  generateItemName,
  onUpdateOptions,
  onStartEditing,
  onToggleCompressed,
}: OrderTableRowProps) {
  
  return (
    <tr className="align-middle">
      <TableCell className="text-center px-4">
        {generateItemName(item)}
      </TableCell>

      <TableCell className="text-center px-2">
        <OrderTableDropdownCell
          field="species"
          id={`row-${item.id}-species`}
          value={item.species}
          options={options.species}
          isEditing={editingField === "species" && editingRowId === item.id}
          newOption={newOption}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={onKeyPress}
          onUpdate={(value) => onUpdateItem({ ...item, species: value })}
          onUpdateOptions={onUpdateOptions}
          onStartEditing={() => onStartEditing("species", item.id)}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <OrderTableDropdownCell
          field="length"
          id={`row-${item.id}-length`}
          value={item.length}
          options={options.length}
          isEditing={editingField === "length" && editingRowId === item.id}
          newOption={newOption}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={onKeyPress}
          onUpdate={(value) => onUpdateItem({ ...item, length: value })}
          onUpdateOptions={onUpdateOptions}
          onStartEditing={() => onStartEditing("length", item.id)}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <OrderTableDropdownCell
          field="bundleType"
          id={`row-${item.id}-bundleType`}
          value={item.bundleType}
          options={options.bundleType}
          isEditing={editingField === "bundleType" && editingRowId === item.id}
          newOption={newOption}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={onKeyPress}
          onUpdate={(value) => onUpdateItem({ ...item, bundleType: value })}
          onUpdateOptions={onUpdateOptions}
          onStartEditing={() => onStartEditing("bundleType", item.id)}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <OrderTableDropdownCell
          field="thickness"
          id={`row-${item.id}-thickness`}
          value={item.thickness}
          options={options.thickness}
          isEditing={editingField === "thickness" && editingRowId === item.id}
          newOption={newOption}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={onKeyPress}
          onUpdate={(value) => onUpdateItem({ ...item, thickness: value })}
          onUpdateOptions={onUpdateOptions}
          onStartEditing={() => onStartEditing("thickness", item.id)}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <OrderTableDropdownCell
          field="packaging"
          id={`row-${item.id}-packaging`}
          value={item.packaging}
          options={options.packaging}
          isEditing={editingField === "packaging" && editingRowId === item.id}
          newOption={newOption}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={onKeyPress}
          onUpdate={(value) => onUpdateItem({ ...item, packaging: value })}
          onUpdateOptions={onUpdateOptions}
          onStartEditing={() => onStartEditing("packaging", item.id)}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <input
          type="number"
          id={`row-${item.id}-pallets`}
          name={`row-${item.id}-pallets`}
          className="w-20 text-center border rounded-md py-2 px-3"
          value={item.pallets}
          onChange={(e) =>
            onUpdateItem({ ...item, pallets: Number(e.target.value) })
          }
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        <input
          type="number"
          id={`row-${item.id}-unitCost`}
          name={`row-${item.id}-unitCost`}
          className="w-20 text-center border rounded-md py-2 px-3"
          value={item.unitCost}
          onChange={(e) =>
            onUpdateItem({ ...item, unitCost: Number(e.target.value) })
          }
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className="text-center px-2">
        ${Number(item.pallets) * Number(item.unitCost)}
      </TableCell>

      <TableCell className="text-center px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0"
              id={`row-${item.id}-actions`}
              name={`row-${item.id}-actions`}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin && (
              <DropdownMenuItem onClick={() => onCopyRow(item)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onRemoveRow(item.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </tr>
  );
}
