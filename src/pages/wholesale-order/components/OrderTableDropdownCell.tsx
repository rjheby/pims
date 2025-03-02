
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
    <div className="flex flex-col">
      {isEditing ? (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => onNewOptionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 min-w-[150px]"
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
          onValueChange={onUpdateItem}
          defaultValue={value}
          disabled={readOnly}
        >
          <SelectTrigger className="min-w-[150px] w-full h-8">
            <SelectValue placeholder={value || `${fieldName}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            {isAdmin && (
              <SelectItem
                value="new"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewOptionInput(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <span>Add new {fieldName}</span>
                  <Plus className="h-4 w-4" />
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
