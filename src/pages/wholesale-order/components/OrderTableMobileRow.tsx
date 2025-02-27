
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronRight, Copy, Edit, Pencil, Plus, Trash, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { DropdownOptions, OrderItem } from "../types";
import { cn } from "@/lib/utils";

interface OrderTableMobileRowProps {
  item: OrderItem & { name?: string, totalCost?: number };
  options: DropdownOptions;
  isAdmin: boolean;
  editingField: string | null;
  newOption: string;
  onNewOptionChange: (option: string) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => void;
  onUpdateItem: (id: number, field: keyof OrderItem, value: string | number) => void;
  onUpdateOptions: (field: keyof DropdownOptions, options: string[]) => void;
  onRemoveRow: (id: number) => void;
  onCopyRow: (item: OrderItem) => void;
  onAddItem: () => void;
  onToggleCompressed: (id: number) => void;
  generateItemName: (item: OrderItem) => string;
  isCompressed: boolean;
  optionFields: Array<keyof DropdownOptions>;
  readOnly?: boolean;
  highlight?: boolean;
}

export function OrderTableMobileRow({
  item,
  options,
  isAdmin,
  editingField,
  newOption,
  onNewOptionChange,
  onKeyPress,
  onUpdateItem,
  onUpdateOptions,
  onRemoveRow,
  onCopyRow,
  onAddItem,
  onToggleCompressed,
  generateItemName,
  isCompressed,
  optionFields,
  readOnly = false,
  highlight = false
}: OrderTableMobileRowProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <Card 
      className={cn(
        "overflow-hidden",
        highlight && "bg-yellow-50 dark:bg-yellow-900/20"
      )}
    >
      <CardHeader className="p-4 bg-muted/30 flex flex-row items-center">
        <Button
          variant="ghost"
          size="sm"
          className="p-0 mr-2"
          onClick={() => onToggleCompressed(item.id)}
        >
          {isCompressed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <h3 className="text-sm font-medium">
            {generateItemName(item)}
          </h3>
        </div>
        {!readOnly && (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onCopyRow(item)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onRemoveRow(item.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      {!isCompressed && (
        <CardContent className="p-4 pt-6 space-y-4">
          {/* Field Value Section */}
          <div className="grid grid-cols-2 gap-4">
            {optionFields.map((field) => (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {!readOnly ? (
                  <Popover open={open[field]} onOpenChange={(value) => setOpen({ ...open, [field]: value })}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-between w-full"
                      >
                        {item[field] || "Select..."}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder={`Search ${field}...`} />
                        <CommandEmpty>
                          <div className="flex flex-col p-2">
                            <span>No {field} found.</span>
                            {isAdmin && (
                              <div className="mt-2">
                                <Input
                                  placeholder={`Add new ${field}`}
                                  value={editingField === `${field}-${item.id}` ? newOption : ""}
                                  onChange={(e) => onNewOptionChange(e.target.value)}
                                  onKeyDown={(e) => onKeyPress(e, field)}
                                  className="text-sm"
                                />
                                <div className="flex justify-end mt-2">
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => {
                                      if (newOption.trim()) {
                                        const updatedOptions = [...options[field], newOption.trim()];
                                        onUpdateOptions(field, updatedOptions);
                                        onUpdateItem(item.id, field, newOption.trim());
                                        onNewOptionChange("");
                                        setOpen({ ...open, [field]: false });
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {options[field].map((option) => (
                            <CommandItem
                              key={option}
                              onSelect={() => {
                                onUpdateItem(item.id, field, option);
                                setOpen({ ...open, [field]: false });
                              }}
                            >
                              {option}
                              {item[field] === option && <Check className="ml-auto h-4 w-4" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div className="h-10 px-3 py-2 border rounded-md text-sm">{item[field] || "-"}</div>
                )}
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                value={item.pallets || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  onUpdateItem(item.id, "pallets", value);
                }}
                min={0}
                readOnly={readOnly}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Unit Cost</label>
              <Input
                type="number"
                value={item.unitCost || ""}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : 0;
                  onUpdateItem(item.id, "unitCost", value);
                }}
                min={0}
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="pt-4 border-t flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium">Total Cost</h4>
              <p className="text-lg font-semibold">
                ${((item.pallets || 0) * (item.unitCost || 0)).toLocaleString()}
              </p>
            </div>
            {!readOnly && (
              <Button onClick={onAddItem} className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
