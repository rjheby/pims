
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownOptions } from "../types";

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
  onStartEditing?: (fieldName: keyof DropdownOptions) => void;
  isAdmin: boolean;
  readOnly?: boolean;
}

export function OrderTableDropdownCell({
  fieldName,
  value,
  options,
  editingField,
  newOption,
  onNewOptionChange,
  onUpdateItem,
  onUpdateOptions,
  onPress,
  onStartEditing,
  isAdmin,
  readOnly = false,
}: OrderTableDropdownCellProps) {
  const isEditing = editingField === fieldName;
  const [showNewOptionInput, setShowNewOptionInput] = useState(false);
  const [editableOption, setEditableOption] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress(event);
    }
  };

  const handleAddOptionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewOptionInput(true);
    setEditableOption("");
    if (onStartEditing) {
      onStartEditing(fieldName);
    }
  };

  const handleEditOptionClick = (e: React.MouseEvent, option: string) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewOptionInput(true);
    setEditableOption(option);
    onNewOptionChange(option);
    if (onStartEditing) {
      onStartEditing(fieldName);
    }
  };

  const handleSaveOption = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newOption && newOption.trim()) {
      onUpdateOptions(newOption);
      setShowNewOptionInput(false);
    }
  };

  if (isEditing || showNewOptionInput) {
    return (
      <div className="flex flex-col sm:flex-row sm:space-x-2 w-full gap-2">
        <Input
          type="text"
          value={newOption}
          onChange={(e) => onNewOptionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-full text-sm text-center"
          autoFocus
          placeholder={editableOption ? `Edit ${fieldName}...` : `New ${fieldName}...`}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveOption}
          className="mt-1 sm:mt-0 whitespace-nowrap text-xs"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-full">
      <Select
        value={value}
        onValueChange={onUpdateItem}
        disabled={readOnly}
      >
        <SelectTrigger className="h-8 w-full min-w-0 max-w-full text-sm text-center">
          <SelectValue 
            placeholder={`Select ${fieldName}`}
            className="text-center overflow-hidden w-full truncate" 
          />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] min-w-[8rem] w-auto max-w-[var(--radix-select-trigger-width)] overflow-hidden bg-white">
          {options.map((option) => (
            <div key={option} className="flex items-center justify-between group">
              <SelectItem value={option} className="truncate text-sm flex-grow text-center">
                {option}
              </SelectItem>
              {isAdmin && !readOnly && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleEditOptionClick(e, option)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {isAdmin && !readOnly && (
            <div 
              className="text-green-600 font-medium border-t border-gray-200 mt-1 pt-1 cursor-pointer hover:bg-accent px-2 py-1.5 rounded-sm text-sm"
              onClick={handleAddOptionClick}
            >
              <div className="flex items-center justify-center">
                <span className="truncate text-center">Add new {fieldName}</span>
                <Plus className="h-4 w-4 ml-1 flex-shrink-0" />
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
