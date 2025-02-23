import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Copy, MoreHorizontal, Plus, Trash, Edit, X } from "lucide-react";
import { OrderItem, DropdownOptions } from "./types";
import { KeyboardEvent, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface OrderTableProps {
  items: OrderItem[];
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: keyof DropdownOptions | null;
  newOption: string;
  onNewOptionChange: (value: string) => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onEditField: (field: keyof DropdownOptions | null) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  generateItemName: (item: OrderItem) => string;
}

export function OrderTable({
  items,
  options,
  isAdmin,
  editingField,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onEditField,
  onUpdateItem,
  onRemoveRow,
  onCopyRow,
  generateItemName,
}: OrderTableProps) {
  const [editingOption, setEditingOption] = useState<string | null>(null);
  const [editedValue, setEditedValue] = useState("");

  const handleStartEdit = (option: string) => {
    setEditingOption(option);
    setEditedValue(option);
  };

  const handleSaveEdit = (field: keyof DropdownOptions, oldValue: string) => {
    if (editedValue && editedValue !== oldValue) {
      const updatedOptions = {
        ...options,
        [field]: options[field].map(opt => opt === oldValue ? editedValue : opt)
      };
      setEditingOption(null);
      items.forEach(item => {
        if (item[field as keyof OrderItem] === oldValue) {
          onUpdateItem(item.id, field as keyof OrderItem, editedValue);
        }
      });
    }
    setEditingOption(null);
  };

  const handleDeleteOption = (field: keyof DropdownOptions, value: string) => {
    const updatedOptions = {
      ...options,
      [field]: options[field].filter(opt => opt !== value)
    };
    items.forEach(item => {
      if (item[field as keyof OrderItem] === value) {
        onUpdateItem(item.id, field as keyof OrderItem, "");
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Name</TableHead>
          {Object.keys(options).map((field) => (
            <TableHead key={field}>
              <div className="flex items-center justify-between">
                <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditField(field as keyof DropdownOptions)}
                    className="text-xs text-[#2A4131] hover:bg-[#F2E9D2]/50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="w-full md:w-1/4 min-w-[200px] text-base md:text-sm">
              {generateItemName(item)}
            </TableCell>
            {Object.keys(options).map((field) => (
              <TableCell key={field} className="min-w-[120px] md:min-w-[160px]">
                <div className="relative">
                  <Select 
                    value={item[field as keyof OrderItem] as string} 
                    onValueChange={(value) => onUpdateItem(item.id, field as keyof OrderItem, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {options[field as keyof DropdownOptions].map((option) => (
                        <div key={option} className="flex items-center justify-between">
                          <SelectItem value={option}>
                            {editingOption === option ? (
                              <Input
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(field as keyof DropdownOptions, option);
                                  }
                                }}
                                className="w-32"
                                autoFocus
                              />
                            ) : (
                              option
                            )}
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
                                  onClick={() => handleDeleteOption(field as keyof DropdownOptions, option)}
                                  className="text-red-600"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      ))}
                      {isAdmin && editingField === field && (
                        <div className="p-2 border-t">
                          <Input
                            value={newOption}
                            onChange={(e) => onNewOptionChange(e.target.value)}
                            onKeyPress={(e) => onKeyPress(e, field as keyof DropdownOptions)}
                            placeholder="Type and press Enter"
                            className="w-full"
                          />
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            ))}
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveRow(item.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyRow(item)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
                    const newPallets = 0; // Default for new row

                    if (totalPallets + newPallets > 24) {
                      toast({
                        title: "Warning",
                        description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
                        variant: "destructive",
                      });
                      return;
                    }

                    onUpdateItem(item.id, "pallets", newPallets);
                  }}
                  className="text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
