
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
  const [editingOptionValue, setEditingOptionValue] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

  const handleStartEdit = (option: string) => {
    setEditingOptionValue(option);
    setEditedValue(option);
  };

  const handleSave = (oldValue: string) => {
    if (editedValue && editedValue !== oldValue) {
      // First update all items that use the old value
      const updatedOptions = { ...options };
      const index = updatedOptions[field].indexOf(oldValue);
      if (index !== -1) {
        updatedOptions[field][index] = editedValue;
      }
      // Then update the current item
      onUpdateItem(item.id, field as keyof OrderItem, editedValue);
    }
    setEditingOptionValue(null);
  };

  const handleDeleteOption = (option: string) => {
    // First update the options list
    const updatedOptions = { ...options };
    updatedOptions[field] = options[field].filter(o => o !== option);
    
    // Then clear the value for this item if it was using the deleted option
    if (item[field as keyof OrderItem] === option) {
      onUpdateItem(item.id, field as keyof OrderItem, "");
    }
  };

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
            <div key={option} className="flex items-center justify-between px-2 py-1">
              {editingOptionValue === option ? (
                <Input
                  value={editedValue}
                  onChange={(e) => setEditedValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave(option);
                    if (e.key === 'Escape') setEditingOptionValue(null);
                  }}
                  onBlur={() => handleSave(option)}
                  className="w-[calc(100%-40px)]"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between w-full">
                  <SelectItem value={option}>
                    {option}
                  </SelectItem>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleStartEdit(option);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteOption(option);
                        }}
                        className="text-red-600"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
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
      
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => onUpdateItem(item.id, field as keyof OrderItem, "")}
              className="text-red-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear Selection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
