
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
}: OrderTableRowProps) {
  return (
    <TableRow>
      <TableCell className={`w-full ${isCompressed ? 'md:w-3/4' : 'md:w-1/4'} min-w-[200px] text-base md:text-sm`}>
        {generateItemName(item) || (
          <div className="h-6 bg-muted/20 rounded animate-pulse" />
        )}
      </TableCell>
      {!isCompressed && Object.keys(options).map((field) => (
        <TableCell key={field} className="min-w-[120px] md:min-w-[160px]">
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
        <div className="flex gap-2 items-center">
          <Button 
            variant="customAction"
            size="sm" 
            onClick={() => onRemoveRow(item.id)} 
            className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button 
            variant="customAction"
            size="sm" 
            onClick={() => onCopyRow(item)} 
            className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant="customAction"
            size="sm" 
            onClick={() => onUpdateOptions("species", [...options.species])} 
            className="rounded-full w-8 h-8 p-0 bg-[#2A4131] hover:bg-slate-50 text-slate-50 hover:text-[#2A4131]"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="customAction"
            size="sm" 
            onClick={() => onToggleCompressed(item.id)} 
            className="rounded-full w-8 h-8 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black"
          >
            {isCompressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
