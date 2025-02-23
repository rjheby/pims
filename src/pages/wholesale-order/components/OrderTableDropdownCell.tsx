
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
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

  const handleStartEdit = (option: string) => {
    setEditingOption(option);
    setEditedValue(option);
  };

  const handleSaveEdit = (oldValue: string) => {
    if (editedValue && editedValue !== oldValue) {
      // Update all items using this option
      onUpdateItem(item.id, field as keyof OrderItem, editedValue);
    }
    setEditingOption(null);
  };

  const handleDeleteOption = (value: string) => {
    onUpdateItem(item.id, field as keyof OrderItem, "");
  };

  return (
    <div className="relative">
      <Select 
        value={item[field as keyof OrderItem] as string} 
        onValueChange={(value) => onUpdateItem(item.id, field as keyof OrderItem, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</span>
          </div>
          {options[field].map((option) => (
            <div key={option} className="flex items-center justify-between px-2">
              {editingOption === option ? (
                <Input
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit(option);
                    } else if (e.key === 'Escape') {
                      setEditingOption(null);
                    }
                  }}
                  onBlur={() => handleSaveEdit(option)}
                  className="w-32 my-1"
                  autoFocus
                />
              ) : (
                <>
                  <SelectItem value={option}>
                    {option}
                  </SelectItem>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStartEdit(option)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOption(option)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>
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
    </div>
  );
}
