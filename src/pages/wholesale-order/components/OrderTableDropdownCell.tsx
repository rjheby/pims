import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Plus } from "lucide-react";
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

  return (
    <div className="flex flex-col w-full">
      {isEditing ? (
        <div className="flex space-x-2 w-full">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => onNewOptionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-full"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onUpdateOptions(newOption);
              setShowNewOptionInput(false);
            }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      ) : (
        <Select
          value={value}
          onValueChange={onUpdateItem}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8 w-full !min-w-0">
            <SelectValue 
              placeholder={fieldName}
              className="text-ellipsis overflow-hidden" 
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {options.map((option) => (
              <SelectItem key={option} value={option} className="truncate">
                {option}
              </SelectItem>
            ))}
            {isAdmin && !showNewOptionInput && (
              <SelectItem
                value="new"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewOptionInput(true);
                }}
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
