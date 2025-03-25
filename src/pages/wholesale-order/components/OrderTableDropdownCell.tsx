
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
import { handleOptionOperation } from "../utils/optionManagement";
import { useToast } from "@/hooks/use-toast";

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
  onOptionsUpdated?: (updatedOptions: DropdownOptions) => void;
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
  onOptionsUpdated,
  isAdmin,
  readOnly = false,
}: OrderTableDropdownCellProps) {
  const { toast } = useToast();
  const isEditing = editingField === fieldName;
  const [showNewOptionInput, setShowNewOptionInput] = useState(false);
  const [editableOption, setEditableOption] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveOption(event);
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

  const handleSaveOption = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newOption || newOption.trim() === "") {
      setShowNewOptionInput(false);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      console.log("Saving option:", newOption, "for field:", fieldName);
      
      // Get all current options from our context via hook
      const allCurrentOptions = {} as DropdownOptions;
      
      // Convert array of options for this field to a full DropdownOptions object
      allCurrentOptions[fieldName] = options;
      
      // Determine if this is adding or updating an option
      const operation = editableOption ? 'update' : 'add';
      
      // Use the utility function to handle the option operation
      const updatedOptions = await handleOptionOperation(
        operation, 
        fieldName, 
        newOption, 
        allCurrentOptions, 
        editableOption
      );
      
      if (updatedOptions && onOptionsUpdated) {
        // Notify parent component of the updated options
        onOptionsUpdated(updatedOptions);
      }
      
      // If we're adding a new option, also send it to the callback for updating options
      if (operation === 'add' && updatedOptions) {
        onUpdateOptions(newOption);
      }
      
      setShowNewOptionInput(false);
      onNewOptionChange(""); // Clear the input after saving
      
      toast({
        title: "Success",
        description: `${operation === 'add' ? 'Added' : 'Updated'} ${fieldName} option`,
      });
      
    } catch (error) {
      console.error("Error saving option:", error);
      toast({
        title: "Error",
        description: "Failed to save option",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
          disabled={isProcessing}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveOption}
          className="mt-1 sm:mt-0 whitespace-nowrap text-xs"
          disabled={isProcessing}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {isProcessing ? "Saving..." : "Save"}
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
