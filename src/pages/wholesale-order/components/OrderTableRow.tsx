
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderTableDropdownCell } from "./OrderTableDropdownCell";
import { OrderTableActions } from "./OrderTableActions";
import { DropdownOptions, OrderItem } from "../types";
import { cn } from "@/lib/utils";

interface OrderTableRowProps {
  item: OrderItem & { name?: string, totalCost?: number };
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: string | null;
  newOption: string;
  onNewOptionChange: (option: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: () => void;
  generateItemName: (item: OrderItem) => string;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
  isCompressed: boolean;
  onToggleCompressed: (id: number) => void;
  readOnly?: boolean;
  highlight?: boolean;
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
  highlight = false
}: OrderTableRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (!readOnly) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <TableRow 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "transition-all",
        highlight && "bg-yellow-50 dark:bg-yellow-900/20",
        isHovered && "bg-muted"
      )}
    >
      <TableCell className="pl-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onToggleCompressed(item.id)}
          >
            {isCompressed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          {item.name}
        </div>
      </TableCell>

      {/* Display fields for species, length, bundleType, thickness, packaging */}
      <TableCell>
        <OrderTableDropdownCell
          value={item.species}
          options={options.species}
          onChange={(value) => onUpdateItem(item.id, "species", value)}
          onAddOption={(option) => {
            const updatedOptions = [...options.species, option];
            onUpdateOptions("species", updatedOptions);
          }}
          isEditing={editingField === `species-${item.id}`}
          onEdit={() => {
            /* Handled by parent */
          }}
          newOption={editingField === `species-${item.id}` ? newOption : ""}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={(e) => onKeyPress(e, "species")}
          isCompressed={isCompressed}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <OrderTableDropdownCell
          value={item.length}
          options={options.length}
          onChange={(value) => onUpdateItem(item.id, "length", value)}
          onAddOption={(option) => {
            const updatedOptions = [...options.length, option];
            onUpdateOptions("length", updatedOptions);
          }}
          isEditing={editingField === `length-${item.id}`}
          onEdit={() => {
            /* Handled by parent */
          }}
          newOption={editingField === `length-${item.id}` ? newOption : ""}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={(e) => onKeyPress(e, "length")}
          isCompressed={isCompressed}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <OrderTableDropdownCell
          value={item.bundleType}
          options={options.bundleType}
          onChange={(value) => onUpdateItem(item.id, "bundleType", value)}
          onAddOption={(option) => {
            const updatedOptions = [...options.bundleType, option];
            onUpdateOptions("bundleType", updatedOptions);
          }}
          isEditing={editingField === `bundleType-${item.id}`}
          onEdit={() => {
            /* Handled by parent */
          }}
          newOption={editingField === `bundleType-${item.id}` ? newOption : ""}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={(e) => onKeyPress(e, "bundleType")}
          isCompressed={isCompressed}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <OrderTableDropdownCell
          value={item.thickness}
          options={options.thickness}
          onChange={(value) => onUpdateItem(item.id, "thickness", value)}
          onAddOption={(option) => {
            const updatedOptions = [...options.thickness, option];
            onUpdateOptions("thickness", updatedOptions);
          }}
          isEditing={editingField === `thickness-${item.id}`}
          onEdit={() => {
            /* Handled by parent */
          }}
          newOption={editingField === `thickness-${item.id}` ? newOption : ""}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={(e) => onKeyPress(e, "thickness")}
          isCompressed={isCompressed}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <OrderTableDropdownCell
          value={item.packaging}
          options={options.packaging}
          onChange={(value) => onUpdateItem(item.id, "packaging", value)}
          onAddOption={(option) => {
            const updatedOptions = [...options.packaging, option];
            onUpdateOptions("packaging", updatedOptions);
          }}
          isEditing={editingField === `packaging-${item.id}`}
          onEdit={() => {
            /* Handled by parent */
          }}
          newOption={editingField === `packaging-${item.id}` ? newOption : ""}
          onNewOptionChange={onNewOptionChange}
          onKeyPress={(e) => onKeyPress(e, "packaging")}
          isCompressed={isCompressed}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          value={item.pallets || ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : 0;
            onUpdateItem(item.id, "pallets", value);
          }}
          className="w-full border rounded-md p-2"
          min={0}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          value={item.unitCost || ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : 0;
            onUpdateItem(item.id, "unitCost", value);
          }}
          className="w-full border rounded-md p-2"
          min={0}
          readOnly={readOnly}
        />
      </TableCell>

      <TableCell>${Number(item.totalCost || 0).toLocaleString()}</TableCell>

      <TableCell className="text-right">
        {readOnly ? (
          <span className="text-sm text-muted-foreground">Read only</span>
        ) : (
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyRow(item)}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Copy</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveRow(item.id)}
              className="h-8 w-8 p-0 text-red-500"
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              onClick={onAddItem}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Add</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
