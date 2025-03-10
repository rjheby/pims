
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus, Edit } from "lucide-react";
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

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onPress(event);
    }
  };

  const handleAddOptionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNewOptionInput(true);
    if (onStartEditing) {
      onStartEditing(fieldName);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-full">
      {isEditing ? (
        <div className="flex flex-col sm:flex-row sm:space-x-2 w-full gap-2">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => onNewOptionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-full text-sm"
            autoFocus
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onUpdateOptions(newOption);
              setShowNewOptionInput(false);
            }}
            className="mt-1 sm:mt-0 whitespace-nowrap text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      ) : (
        <Select
          value={value}
          onValueChange={onUpdateItem}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8 w-full min-w-0 max-w-full text-sm">
            <SelectValue 
              placeholder={fieldName}
              className="text-ellipsis overflow-hidden w-full truncate" 
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] min-w-[8rem] w-auto max-w-[var(--radix-select-trigger-width)] overflow-hidden">
            {options.map((option) => (
              <SelectItem key={option} value={option} className="truncate text-sm">
                {option}
              </SelectItem>
            ))}
            {isAdmin && !readOnly && (
              <SelectItem
                value="add_new"
                onClick={handleAddOptionClick}
                className="text-green-600 font-medium border-t border-gray-200 mt-1 pt-1 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">Add new {fieldName}</span>
                  <Plus className="h-4 w-4 ml-1 flex-shrink-0" />
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
