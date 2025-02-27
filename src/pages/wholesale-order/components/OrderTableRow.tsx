import { TableCell, TableRow } from "@/components/ui/table";
import { OrderItem, DropdownOptions } from "../types";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Copy, X, Maximize2, Minimize2 } from "lucide-react";

interface OrderTableRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  isCompressed: boolean;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
  onToggleCompressed: (id: number) => void;
  generateItemName: (item: OrderItem) => string;
  onAddItem: () => void;
  readOnly?: boolean;
}

export function OrderTableRow({
  item,
  options,
  isAdmin,
  editingField,
  newOption,
  isCompressed,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onRemoveRow,
  onCopyRow,
  generateItemName,
  onUpdateOptions,
  onToggleCompressed,
  onAddItem,
  readOnly = false,
}: OrderTableRowProps) {
  const totalCost = (item.pallets || 0) * (item.unitCost || 0);

  return (
    <TableRow>
      <TableCell className="w-[20%] text-base md:text-sm px-2">
        {generateItemName(item) || (
          <div className="h-6 bg-muted/20 rounded animate-pulse" />
        )}
      </TableCell>
      {!isCompressed && Object.keys(options).map((field) => (
        <TableCell key={field} className="w-[13%] px-2">
          <OrderTableDropdownCell
            field={field as keyof DropdownOptions}
            item={item}
            options={options}
            isAdmin={isAdmin}
            editingField={editingField}
            newOption={newOption}
            onNewOptionChange={onNewOptionChange}
            onKeyPress={onKeyPress}
            onUpdateItem={onUpdateItem}
            onUpdateOptions={onUpdateOptions}
            readOnly={readOnly}
          />
        </TableCell>
      ))}
      {!isCompressed && (
        <>
          <TableCell className="w-[6%] px-2">
            {readOnly ? (
              <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                {item.pallets || 0}
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                value={item.pallets || ""}
                onChange={(e) => onUpdateItem(item.id, "pallets", parseInt(e.target.value) || 0)}
                className="min-w-[50px] max-w-full text-center px-1 h-9"
                placeholder="Qty"
                disabled={readOnly}
              />
            )}
          </TableCell>
          <TableCell className="w-[10%] px-2">
            {readOnly ? (
              <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                {item.unitCost || 0}
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                value={item.unitCost || ""}
                onChange={(e) => onUpdateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                className="min-w-[60px] max-w-full"
                placeholder="Cost"
                disabled={readOnly}
              />
            )}
          </TableCell>
          <TableCell className="w-[8%] px-2">
            <div className="text-right">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </TableCell>
        </>
      )}
      <TableCell className="w-[10%] px-2">
        {!readOnly && (
          <div className="flex gap-0.5 items-center justify-end md:justify-start">
            <Button 
              variant="customAction"
              size="sm" 
              onClick={() => onRemoveRow(item.id)} 
              className="rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
              disabled={readOnly}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={() => onCopyRow(item)} 
              className="rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
              disabled={readOnly}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={onAddItem}
              className="rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 bg-[#2A4131] hover:bg-slate-50 text-slate-50 hover:text-[#2A4131]"
              disabled={readOnly}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={() => onToggleCompressed(item.id)} 
              className="rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black md:hidden"
            >
              {isCompressed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
          </div>
        )}
        {readOnly && (
          <Button 
            variant="customAction"
            size="sm" 
            onClick={() => onToggleCompressed(item.id)} 
            className="rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black md:hidden"
          >
            {isCompressed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
