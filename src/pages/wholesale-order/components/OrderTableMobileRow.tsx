
import { OrderItem, DropdownOptions } from "../types";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Copy, X, Maximize2, Minimize2 } from "lucide-react";

interface OrderTableMobileRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  isCompressed: boolean;
  optionFields: Array<keyof DropdownOptions>;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: () => void;
  onToggleCompressed: (id: number) => void;
  generateItemName: (item: OrderItem) => string;
  readOnly?: boolean;
}

export function OrderTableMobileRow({
  item,
  options,
  isAdmin,
  editingField,
  newOption,
  isCompressed,
  optionFields,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onUpdateOptions,
  onRemoveRow,
  onCopyRow,
  onAddItem,
  onToggleCompressed,
  generateItemName,
  readOnly = false,
}: OrderTableMobileRowProps) {
  return (
    <div className="bg-white rounded-lg border p-2 sm:p-4 space-y-2 overflow-hidden mb-4">
      <div className="font-medium text-sm break-words">{generateItemName(item)}</div>
      {!isCompressed && (
        <div className="grid gap-3">
          {optionFields.map((field) => (
            <div key={field} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </div>
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
                readOnly={readOnly}
              />
            </div>
          ))}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Quantity
            </div>
            {readOnly ? (
              <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                {item.pallets || 0}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={item.pallets || ""}
                onChange={(e) => onUpdateItem(item.id, "pallets", parseInt(e.target.value) || 0)}
                className="h-9 w-full min-w-[50px]"
                placeholder="Qty"
                disabled={readOnly}
              />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Unit Cost
            </div>
            {readOnly ? (
              <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
                {item.unitCost || 0}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min="0"
                value={item.unitCost || ""}
                onChange={(e) => onUpdateItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                className="h-9 w-full min-w-[60px]"
                placeholder="Cost"
                disabled={readOnly}
              />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">
              Total Cost
            </div>
            <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
              ${((item.pallets || 0) * (item.unitCost || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-1.5 justify-center pt-2 border-t">
        {!readOnly && (
          <>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={() => onRemoveRow(item.id)} 
              className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
              disabled={readOnly}
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={() => onCopyRow(item)} 
              className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
              disabled={readOnly}
              aria-label="Copy item"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="customAction"
              size="sm" 
              onClick={onAddItem} 
              className="rounded-full w-8 h-8 p-0 bg-[#2A4131] hover:bg-slate-50 text-slate-50 hover:text-[#2A4131]"
              disabled={readOnly}
              aria-label="Add new item"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button 
          variant="customAction"
          size="sm" 
          onClick={() => onToggleCompressed(item.id)} 
          className="rounded-full w-8 h-8 p-0 bg-black hover:bg-slate-50 text-slate-50 hover:text-black"
          aria-label={isCompressed ? "Expand item" : "Collapse item"}
        >
          {isCompressed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
