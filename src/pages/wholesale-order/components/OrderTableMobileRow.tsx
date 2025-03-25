
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { OrderItem, DropdownOptions } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface OrderTableMobileRowProps {
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  editingRowId: number | null;
  newOption: string;
  isCompressed: boolean;
  optionFields: string[];
  readOnly?: boolean;
  onNewOptionChange: (option: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdateItem: (item: OrderItem) => void;
  onUpdateOptions: (option: string) => void;
  onStartEditing: (field: keyof DropdownOptions, rowId: number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: (item?: Partial<OrderItem>) => void;
  onToggleCompressed: (id: number) => void;
  generateItemName: (item: OrderItem) => string;
}

export function OrderTableMobileRow({
  item,
  options,
  isAdmin,
  editingField,
  editingRowId,
  newOption,
  isCompressed,
  optionFields,
  readOnly = false,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onUpdateOptions,
  onStartEditing,
  onRemoveRow,
  onCopyRow,
  onAddItem,
  onToggleCompressed,
  generateItemName,
}: OrderTableMobileRowProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedItem = { ...item, [name]: value };
    onUpdateItem(updatedItem);
  };

  const handleDropdownChange = (field: keyof OrderItem, value: string) => {
    const updatedItem = { ...item, [field]: value };
    onUpdateItem(updatedItem);
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="grid gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{generateItemName(item)}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                id={`mobile-row-${item.id}-actions`}
                name={`mobile-row-${item.id}-actions`}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCopyRow(item)}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRemoveRow(item.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {optionFields.map(field => (
          <div key={field} className="grid gap-1">
            <label htmlFor={`mobile-${item.id}-${field}`} className="text-sm font-medium">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <OrderTableDropdownCell
              id={`mobile-${item.id}-${field}`}
              field={field as keyof DropdownOptions}
              value={item[field as keyof OrderItem] as string}
              options={options[field as keyof DropdownOptions] || []}
              isEditing={editingField === field as keyof DropdownOptions && editingRowId === item.id}
              newOption={newOption}
              onNewOptionChange={onNewOptionChange}
              onKeyPress={onKeyPress}
              onUpdate={(value) => handleDropdownChange(field as keyof OrderItem, value)}
              onUpdateOptions={onUpdateOptions}
              onStartEditing={() => onStartEditing(field as keyof DropdownOptions, item.id)}
              readOnly={readOnly}
            />
          </div>
        ))}

        <div className="grid gap-1">
          <label htmlFor={`mobile-${item.id}-pallets`} className="text-sm font-medium">
            QTY
          </label>
          <Input
            type="number"
            id={`mobile-${item.id}-pallets`}
            name="pallets"
            value={String(item.pallets)}
            onChange={handleInputChange}
            className="text-right"
            readOnly={readOnly}
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor={`mobile-${item.id}-unitCost`} className="text-sm font-medium">
            Unit Cost
          </label>
          <Input
            type="number"
            id={`mobile-${item.id}-unitCost`}
            name="unitCost"
            value={String(item.unitCost)}
            onChange={handleInputChange}
            className="text-right"
            readOnly={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
