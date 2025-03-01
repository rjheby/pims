import {
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Trash,
  CheckCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { OrderItem, DropdownOptions, WoodProduct, safeNumber } from "../types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductSelector } from "./ProductSelector";

interface OrderTableDropdownCellProps {
  fieldName: keyof DropdownOptions;
  value: string;
  options: string[];
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onUpdateItem: (value: string) => void;
  onUpdateOptions: (option: string) => void;
  onPress: (event: any) => void;
  isAdmin: boolean;
  readOnly?: boolean;
}

function OrderTableDropdownCell({
  fieldName,
  value,
  options,
  editingField,
  newOption,
  onNewOptionChange,
  onUpdateItem,
  onUpdateOptions,
  onPress,
  isAdmin,
  readOnly = false,
}: OrderTableDropdownCellProps) {
  const isEditing = editingField === fieldName;
  const [showNewOptionInput, setShowNewOptionInput] = useState(false);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress(event);
    }
  };

  return (
    <div className="flex flex-col">
      {isEditing ? (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => onNewOptionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onUpdateOptions(newOption);
              setShowNewOptionInput(false);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      ) : (
        <Select
          onValueChange={onUpdateItem}
          defaultValue={value}
          disabled={readOnly}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder={value || `Select ${fieldName}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            {isAdmin && (
              <SelectItem
                value="new"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewOptionInput(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <span>Add new {fieldName}</span>
                  <Plus className="h-4 w-4" />
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

interface OrderTableRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (event: any) => void;
  onUpdateItem: (item: OrderItem) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: () => void;
  generateItemName: (item: OrderItem) => string;
  onUpdateOptions: (field: keyof DropdownOptions, option: string) => void;
  isCompressed: boolean;
  onToggleCompressed: (id: number) => void;
  readOnly?: boolean;
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
  onAddItem,
  generateItemName,
  onUpdateOptions,
  isCompressed,
  onToggleCompressed,
  readOnly = false,
}: OrderTableRowProps) {
  const optionFields = Object.keys(options) as Array<keyof typeof options>;
  const [showProductSelector, setShowProductSelector] = useState(false);

  const handleProductSelect = (product: WoodProduct) => {
    onUpdateItem({
      ...item,
      species: product.species,
      length: product.length,
      bundleType: product.bundle_type,
      thickness: product.thickness,
      unitCost: product.unit_cost,
      productId: product.id
    });
    setShowProductSelector(false);
  };
  
  const openProductSelector = () => {
    if (!readOnly) {
      setShowProductSelector(true);
    }
  };

  return (
    <TableRow>
      <TableCell
        className={cn("font-medium whitespace-nowrap", isCompressed && "w-1/2")}
      >
        <div className="flex items-center space-x-2">
          {isCompressed ? (
            <div
              className={cn(
                "cursor-pointer hover:text-blue-600",
                "flex space-x-2 items-center"
              )}
              onClick={() => onToggleCompressed(item.id)}
            >
              <ChevronRight className="h-4 w-4" />
              <span>{generateItemName(item)}</span>
            </div>
          ) : (
            <div
              className={cn(
                "cursor-pointer hover:text-blue-600",
                "flex space-x-2 items-center"
              )}
              onClick={() => onToggleCompressed(item.id)}
            >
              <ChevronDown className="h-4 w-4" />
              <div className="cursor-pointer hover:underline text-blue-600" onClick={(e) => {
                e.stopPropagation();
                openProductSelector();
              }}>
                {generateItemName(item) || "Select product"}
              </div>
            </div>
          )}
        </div>
      </TableCell>

      {!isCompressed && !readOnly &&
        optionFields.map((field) => (
          <TableCell key={field}>
            <OrderTableDropdownCell
              fieldName={field}
              value={item[field] as string}
              options={options[field]}
              editingField={editingField}
              newOption={newOption}
              onNewOptionChange={onNewOptionChange}
              onUpdateItem={(value) => onUpdateItem({ ...item, [field]: value })}
              onUpdateOptions={(option) => onUpdateOptions(field, option)}
              onPress={onKeyPress}
              isAdmin={isAdmin}
              readOnly={readOnly}
            />
          </TableCell>
        ))}

      <TableCell className={isCompressed ? "hidden" : ""}>
        <Input
          type="number"
          min="0"
          step="1"
          value={item.pallets || ""}
          onChange={(e) =>
            onUpdateItem({ ...item, pallets: Number(e.target.value) })
          }
          className="h-8"
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className={isCompressed ? "hidden" : ""}>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unitCost || ""}
          onChange={(e) =>
            onUpdateItem({ ...item, unitCost: Number(e.target.value) })
          }
          className="h-8"
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className="text-right">
        ${(safeNumber(item.pallets) * safeNumber(item.unitCost)).toFixed(2)}
      </TableCell>

      <TableCell className={isCompressed ? "hidden" : ""}>
        <div className="flex space-x-1">
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCopyRow(item)}
                aria-label="Copy row"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveRow(item.id)}
                aria-label="Remove row"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
      
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="sm:max-w-[600px]">
          <ProductSelector 
            onSelect={handleProductSelect}
            onCancel={() => setShowProductSelector(false)}
            initialValues={{
              species: item.species,
              length: item.length,
              bundleType: item.bundleType,
              thickness: item.thickness
            }}
          />
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}
