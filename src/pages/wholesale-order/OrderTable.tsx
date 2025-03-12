
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { Button } from "@/components/ui/button";
import { useOrderTable } from "./hooks/useOrderTable";
import { OrderItem } from "./types";
import { useToast } from "@/hooks/use-toast";

interface OrderTableProps {
  readOnly?: boolean;
  onItemsChange?: (items: OrderItem[]) => void;
}

export function OrderTable({ readOnly = false, onItemsChange }: OrderTableProps) {
  const { toast } = useToast();
  const {
    items,
    options,
    isAdmin,
    editingField,
    newOption,
    optionFields,
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    generateItemName,
    handleUpdateOptions,
    handleStartEditingField,
    toggleCompressed,
    setNewOption,
    sortConfig,
    setSortConfig,
    filterValue,
    setFilterValue,
  } = useOrderTable();

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  // Define consistent column widths and alignments
  const headers = [
    { key: 'name', label: 'Name', sortable: true, className: 'w-[22%] text-left px-4' },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true,
      className: 'w-[10%] text-center px-2'
    })),
    { key: 'pallets', label: 'QTY', sortable: true, className: 'w-[8%] text-center px-2' },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, className: 'w-[10%] text-right px-2' },
    { key: 'totalCost', label: 'Total Cost', sortable: true, className: 'w-[10%] text-right px-2' },
    { key: 'actions', label: '', className: 'w-[10%] text-center px-2' }
  ];

  const tableData = items.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: Number(item.pallets) * Number(item.unitCost)
  }));

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filter: string) => {
    setFilterValue(filter);
  };

  const addNewRow = () => {
    try {
      console.log("Add row button clicked");
      handleAddItem();
      toast({
        title: "Success",
        description: "New row added successfully",
      });
    } catch (error) {
      console.error("Error adding new row:", error);
      toast({
        title: "Error",
        description: "Failed to add new row",
        variant: "destructive"
      });
    }
  };

  const TableActions = () => (
    <div className="flex justify-end mb-4">
      <Button 
        onClick={addNewRow}
        className="bg-[#2A4131] hover:bg-[#2A4131]/90"
        disabled={readOnly}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add New Row
      </Button>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-10 border rounded-md bg-gray-50">
      <p className="text-gray-500 mb-4">No items added yet</p>
      <Button 
        onClick={addNewRow}
        className="bg-[#2A4131] hover:bg-[#2A4131]/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Row
      </Button>
    </div>
  );

  if (items.length === 0 && !readOnly) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {!readOnly && <TableActions />}
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <BaseOrderTable
          headers={headers}
          data={tableData}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
        >
          {tableData.map(item => (
            <OrderTableRow
              key={item.id}
              item={item}
              options={options}
              isAdmin={isAdmin}
              editingField={editingField}
              newOption={newOption}
              onNewOptionChange={setNewOption}
              onKeyPress={(e) => handleKeyPress(e, editingField || "")}
              onUpdateItem={handleUpdateItem}
              onRemoveRow={handleRemoveRow}
              onCopyRow={handleCopyRow}
              onAddItem={handleAddItem}
              generateItemName={generateItemName}
              onUpdateOptions={handleUpdateOptions}
              onStartEditing={handleStartEditingField}
              isCompressed={false}
              onToggleCompressed={toggleCompressed}
              readOnly={readOnly}
            />
          ))}
        </BaseOrderTable>
      </div>

      {/* Mobile View */}
      <div className="md:hidden w-full">
        <div className="grid gap-4 w-full">
          {items.map(item => (
            <OrderTableMobileRow
              key={item.id}
              item={item}
              options={options}
              isAdmin={isAdmin}
              editingField={editingField}
              newOption={newOption}
              isCompressed={false}
              optionFields={optionFields}
              onNewOptionChange={setNewOption}
              onKeyPress={(e) => handleKeyPress(e, editingField || "")}
              onUpdateItem={handleUpdateItem}
              onUpdateOptions={handleUpdateOptions}
              onStartEditing={handleStartEditingField}
              onRemoveRow={handleRemoveRow}
              onCopyRow={handleCopyRow}
              onAddItem={handleAddItem}
              onToggleCompressed={toggleCompressed}
              generateItemName={generateItemName}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
