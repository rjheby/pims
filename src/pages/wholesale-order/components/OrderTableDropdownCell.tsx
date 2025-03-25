
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { DropdownOptions } from '../types';

export interface OrderTableDropdownCellProps {
  field: keyof DropdownOptions;
  id?: string; // Make id optional
  value: string;
  options: string[];
  isEditing: boolean;
  newOption: string;
  onNewOptionChange: (option: string) => void;
  onKeyPress: (e: ReactKeyboardEvent<HTMLInputElement>) => void;
  onUpdate: (value: any) => void;
  onUpdateOptions: (option: string) => void;
  onStartEditing: () => void;
  readOnly: boolean;
}

export function OrderTableDropdownCell({
  field,
  id,
  value,
  options,
  isEditing,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onUpdate,
  onUpdateOptions,
  onStartEditing,
  readOnly
}: OrderTableDropdownCellProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Generate a unique ID for the field if one is not provided
  const fieldId = id || `${field}-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (readOnly) {
    return <div className="px-2 py-1">{value}</div>;
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          type="text"
          id={`${fieldId}-input`}
          name={`${fieldId}-input`}
          value={newOption}
          onChange={(e) => onNewOptionChange(e.target.value)}
          onKeyDown={onKeyPress}
          className="w-full h-8 text-sm"
          placeholder={`Add new ${field}`}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2"
          onClick={() => onUpdateOptions(newOption)}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 justify-start px-2 text-left font-normal w-full hover:bg-transparent"
          id={`${fieldId}-trigger`}
          name={`${fieldId}-trigger`}
        >
          <span className="truncate">{value || `Select ${field}`}</span>
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]" align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            className="cursor-pointer"
            onClick={() => {
              onUpdate(option);
              setOpen(false);
            }}
          >
            {option}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          className="cursor-pointer flex items-center text-primary"
          onClick={() => {
            setOpen(false);
            onStartEditing();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add new option
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
