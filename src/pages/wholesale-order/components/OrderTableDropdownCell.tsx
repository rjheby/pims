
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
import { DropdownOptions } from "../types";
import { useState } from "react";

interface OrderTableDropdownCellProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onAddOption: (option: string) => void;
  isEditing: boolean;
  onEdit: () => void;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isCompressed: boolean;
  readOnly?: boolean;
}

export function OrderTableDropdownCell({
  value,
  options,
  onChange,
  onAddOption,
  isEditing,
  newOption,
  onNewOptionChange,
  onKeyPress,
  isCompressed,
  readOnly = false,
}: OrderTableDropdownCellProps) {
  const [editingOptionValue, setEditingOptionValue] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

  const handleStartEdit = (option: string) => {
    if (readOnly) return;
    setEditingOptionValue(option);
    setEditedValue(option);
  };

  const handleSave = (oldValue: string) => {
    if (readOnly) return;
    if (editedValue && editedValue !== oldValue) {
      const updatedOptions = [...options];
      const index = updatedOptions.indexOf(oldValue);
      if (index !== -1) {
        updatedOptions[index] = editedValue;
        // Update options in parent
        // Note: This doesn't directly update the options, but signals to the parent
        onAddOption(editedValue);
      }
      // Update the current value if it matched the old one
      if (value === oldValue) {
        onChange(editedValue);
      }
    }
    setEditingOptionValue(null);
  };

  const handleDeleteOption = (option: string) => {
    if (readOnly) return;
    const updatedOptions = options.filter(o => o !== option);
    // We don't have a direct "removeOption" prop, so we'll need to handle this differently
    // This is a workaround - ideally the parent component would handle this
    
    // Clear the value for this item if it was using the deleted option
    if (value === option) {
      onChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      onKeyPress(e);
    }
  };

  if (readOnly) {
    return (
      <div className="px-3 py-2 border border-input bg-background rounded-md text-sm">
        {value || '-'}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {isEditing && (
            <div className="p-2 border-t">
              <Input
                value={newOption}
                onChange={(e) => onNewOptionChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type and press Enter to add"
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </SelectContent>
      </Select>
      
      {!readOnly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem 
              onClick={() => onChange("")}
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
