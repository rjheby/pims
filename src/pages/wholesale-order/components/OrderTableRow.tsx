
import {
  ChevronDown,
  ChevronUp,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductSelector } from "./ProductSelector";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";

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
  onStartEditing?: (field: keyof DropdownOptions) => void;
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
  onStartEditing,
  isCompressed,
  onToggleCompressed,
  readOnly = false,
}: OrderTableRowProps) {
  const optionFields = Object.keys(options) as Array<keyof typeof options>;
  const [showProductSelector, setShowProductSelector] = useState(false);
  const { setOptions } = useWholesaleOrder();

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
  
  const openProductSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!readOnly) {
      setShowProductSelector(true);
    }
  };

  const handleOptionsUpdated = (updatedOptions: DropdownOptions) => {
    console.log("Options updated in OrderTableRow:", updatedOptions);
    setOptions(updatedOptions);
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="flex items-center justify-center space-x-2">
          {isCompressed ? (
            <div
              className={cn(
                "cursor-pointer hover:text-blue-600",
                "flex space-x-2 items-center justify-center"
              )}
              onClick={() => onToggleCompressed(item.id)}
            >
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{generateItemName(item)}</span>
            </div>
          ) : (
            <div
              className={cn(
                "cursor-pointer hover:text-blue-600",
                "flex space-x-2 items-center justify-center"
              )}
              onClick={() => onToggleCompressed(item.id)}
            >
              <ChevronUp className="h-4 w-4 flex-shrink-0" />
              <div 
                className="cursor-pointer hover:underline text-blue-600 overflow-hidden text-ellipsis" 
                onClick={openProductSelector}
              >
                {generateItemName(item) || "Select product"}
              </div>
            </div>
          )}
        </div>
      </TableCell>

      {!isCompressed && !readOnly &&
        optionFields.map((field) => (
          <TableCell key={field} className="p-1">
            <OrderTableDropdownCell
              fieldName={field}
              value={item[field] as string}
              options={options[field]}
              editingField={editingField}
              newOption={newOption}
              onNewOptionChange={onNewOptionChange}
              onUpdateItem={(value) => onUpdateItem({ ...item, [field]: value })}
              onUpdateOptions={(option) => onUpdateOptions(field, option)}
              onOptionsUpdated={handleOptionsUpdated}
              onPress={onKeyPress}
              onStartEditing={onStartEditing}
              isAdmin={isAdmin}
              readOnly={readOnly}
            />
          </TableCell>
        ))}

      <TableCell className={isCompressed ? "hidden" : "p-1"}>
        <Input
          type="number"
          min="0"
          step="1"
          value={item.pallets || ""}
          onChange={(e) =>
            onUpdateItem({ ...item, pallets: Number(e.target.value) })
          }
          className="h-8 w-full !min-w-0 text-center"
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className={isCompressed ? "hidden" : "p-1"}>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.unitCost || ""}
          onChange={(e) =>
            onUpdateItem({ ...item, unitCost: Number(e.target.value) })
          }
          className="h-8 w-full !min-w-0 text-center"
          disabled={readOnly}
        />
      </TableCell>

      <TableCell className="text-center p-1">
        ${(safeNumber(item.pallets) * safeNumber(item.unitCost)).toFixed(2)}
      </TableCell>

      <TableCell className={isCompressed ? "hidden" : "p-1"}>
        <div className="flex space-x-1 justify-center">
          {!readOnly && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyRow(item)}
                aria-label="Copy row"
                className="h-7 w-7 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveRow(item.id)}
                aria-label="Remove row"
                className="h-7 w-7 p-0"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
      
      <Dialog open={showProductSelector} onOpenChange={setShowProductSelector}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Select Product</DialogTitle>
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
