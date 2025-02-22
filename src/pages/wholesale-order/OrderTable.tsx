
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
import { Minus, Copy } from "lucide-react";
import { OrderItem, DropdownOptions } from "./types";
import { KeyboardEvent } from "react";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Name</TableHead>
          {Object.keys(options).map((field) => (
            <TableHead key={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </TableHead>
          ))}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="w-1/4 min-w-[200px]">{generateItemName(item)}</TableCell>
            {Object.keys(options).map((field) => (
              <TableCell key={field}>
                <div className="relative">
                  <Select 
                    value={item[field as keyof OrderItem] as string} 
                    onValueChange={(value) => onUpdateItem(item.id, field as keyof OrderItem, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {options[field as keyof DropdownOptions].map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditField(field as keyof DropdownOptions)}
                      className="absolute -top-6 right-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600"
                    >
                      Edit Options
                    </Button>
                  )}
                  {isAdmin && editingField === field && (
                    <div className="absolute left-36 top-0 z-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
                      <Input
                        value={newOption}
                        onChange={(e) => onNewOptionChange(e.target.value)}
                        onKeyPress={(e) => onKeyPress(e, field as keyof DropdownOptions)}
                        className="mb-2"
                        placeholder="Press Enter to add"
                      />
                    </div>
                  )}
                </div>
              </TableCell>
            ))}
            <TableCell>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveRow(item.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyRow(item)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
