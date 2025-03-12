
import { useEffect } from "react";
import { Plus } from "lucide-react";

// Components
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { Button } from "@/components/ui/button";

// Hooks and Types
import { useOrderTable } from "./hooks/useOrderTable";
import { OrderItem, calculateItemTotal, safeNumber } from "./types";
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

  // Define column widths that will scale proportionally
  const headers = [
    { key: 'name', label: 'Name', sortable: true, className: 'w-[22%] text-center' },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true,
      className: `w-[10%] text-center`
    })),
    { key: 'pallets', label: 'QTY', sortable: true, className: 'w-[8%] text-center' },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, className: 'w-[10%] text-center' },
    { key: 'totalCost', label: 'Total Cost', sortable: true, className: 'w-[10%] text-center' },
    { key: 'actions', label: 'Actions', className: 'w-[10%] text-center' }
  ];

  const tableData = items.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: safeNumber(item.pallets) * safeNumber(item.unitCost)
  }));

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filter: string) => {
    setFilterValue(filter);
  };

  const addNewRow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log("Add row button clicked - direct handler");
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
      {/* Desktop View */}
      <div className="hidden md:block">
        <BaseOrderTable
          headers={headers}
          data={tableData}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onAddRow={!readOnly ? addNewRow : undefined}
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
      
      {!readOnly && items.length > 0 && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={addNewRow}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90 w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Row
          </Button>
        </div>
      )}
    </div>
  );
}
