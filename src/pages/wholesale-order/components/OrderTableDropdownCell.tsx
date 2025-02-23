
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { OrderItem, DropdownOptions } from "../types";
import { useState } from "react";

interface OrderTableDropdownCellProps {
  field: keyof DropdownOptions;
  item: OrderItem;
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
}

export function OrderTableDropdownCell({
  field,
  item,
  options,
  isAdmin,
  editingField,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
}: OrderTableDropdownCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(item[field as keyof OrderItem] as string);

  const handleSave = () => {
    if (editedValue && editedValue !== item[field as keyof OrderItem]) {
      onUpdateItem(item.id, field as keyof OrderItem, editedValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        value={editedValue}
        onChange={(e) => setEditedValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setIsEditing(false);
        }}
        onBlur={handleSave}
        className="w-full"
        autoFocus
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={item[field as keyof OrderItem] as string} 
        onValueChange={(value) => onUpdateItem(item.id, field as keyof OrderItem, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options[field].map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {isAdmin && (
            <div className="p-2 border-t">
              <Input
                value={newOption}
                onChange={(e) => onNewOptionChange(e.target.value)}
                onKeyPress={(e) => onKeyPress(e, field)}
                placeholder="Type and press Enter to add"
                className="w-full"
              />
            </div>
          )}
        </SelectContent>
      </Select>
      
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onUpdateItem(item.id, field as keyof OrderItem, "")}
              className="text-red-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
