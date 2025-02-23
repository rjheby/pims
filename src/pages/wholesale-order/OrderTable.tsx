
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderItem, DropdownOptions } from "./types";
import { OrderTableRow } from "./components/OrderTableRow";
import { KeyboardEvent } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

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
  onReorderItems?: (items: OrderItem[]) => void;
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
  onReorderItems,
}: OrderTableProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id.toString() === active.id);
      const newIndex = items.findIndex(item => item.id.toString() === over.id);
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      onReorderItems?.(newItems);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && <TableHead className="w-[50px]" />}
            <TableHead className="w-1/4">Name</TableHead>
            {Object.keys(options).map((field) => (
              <TableHead key={field}>
                <div className="flex items-center justify-between">
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                </div>
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext items={items.map(item => item.id.toString())} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <OrderTableRow
                key={item.id}
                item={item}
                options={options}
                isAdmin={isAdmin}
                editingField={editingField}
                newOption={newOption}
                onNewOptionChange={onNewOptionChange}
                onKeyPress={onKeyPress}
                onUpdateItem={onUpdateItem}
                onRemoveRow={onRemoveRow}
                onCopyRow={onCopyRow}
                generateItemName={generateItemName}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
