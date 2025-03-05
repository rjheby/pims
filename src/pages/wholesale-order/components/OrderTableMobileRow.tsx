
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { OrderItem, DropdownOptions, WoodProduct, safeNumber } from "../types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ProductSelector } from "./ProductSelector";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";

interface OrderTableMobileRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: string | null;
  newOption: string;
  isCompressed: boolean;
  optionFields: string[];
  onNewOptionChange: (value: string) => void;
  onKeyPress: (event: any, fieldName: string) => void;
  onUpdateItem: (item: OrderItem) => void;
  onUpdateOptions: (field: keyof DropdownOptions, option: string) => void;
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
  
  // Function to handle opening the product selector
  const openProductSelector = () => {
    if (!readOnly) {
      setShowProductSelector(true);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div
          className="flex items-start gap-2 cursor-pointer w-full"
          onClick={() => onToggleCompressed(item.id)}
        >
          <div className="flex-shrink-0 mt-1">
            {isCompressed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </div>
          <div className="font-medium break-words w-full">
            <div 
              className="cursor-pointer hover:underline text-blue-600 whitespace-normal break-words truncate" 
              onClick={(e) => {
                e.stopPropagation();
                openProductSelector();
              }}
            >
              {generateItemName(item) || "Select product"}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
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
      </CardHeader>
      
      {!isCompressed && (
        <CardContent className="p-4 pt-0 grid gap-3">
          {optionFields.map((field) => (
            <div key={field} className="grid grid-cols-2 gap-2 items-center">
              <Label htmlFor={`${field}-${item.id}`}>{field}</Label>
              <div className="w-full">
                <OrderTableDropdownCell
                  fieldName={field as keyof DropdownOptions}
                  value={item[field as keyof OrderItem] as string}
                  options={options[field as keyof DropdownOptions]}
                  editingField={editingField as keyof DropdownOptions}
                  newOption={newOption}
                  onNewOptionChange={onNewOptionChange}
                  onUpdateItem={(value) => onUpdateItem({ ...item, [field]: value })}
                  onUpdateOptions={(option) => onUpdateOptions(field as keyof DropdownOptions, option)}
                  onPress={(e) => onKeyPress(e, field)}
                  isAdmin={isAdmin}
                  readOnly={readOnly}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor={`pallets-${item.id}`}>Pallets</Label>
            <Input
              id={`pallets-${item.id}`}
              type="number"
              min="0"
              step="1"
              value={item.pallets || ""}
              onChange={(e) =>
                onUpdateItem({ ...item, pallets: Number(e.target.value) })
              }
              className="h-8 w-full"
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label htmlFor={`unitCost-${item.id}`}>Unit Cost</Label>
            <Input
              id={`unitCost-${item.id}`}
              type="number"
              min="0"
              step="0.01"
              value={item.unitCost || ""}
              onChange={(e) =>
                onUpdateItem({ ...item, unitCost: Number(e.target.value) })
              }
              className="h-8 w-full"
              disabled={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Total Cost</Label>
            <div className="text-right font-medium">
              ${(safeNumber(item.pallets) * safeNumber(item.unitCost)).toFixed(2)}
            </div>
          </div>
        </CardContent>
      )}
      
      {/* Product Selector Dialog */}
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
    </Card>
  );
}
