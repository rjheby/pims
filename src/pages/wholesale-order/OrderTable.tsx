
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

interface OrderTableProps {
  readOnly?: boolean;
  onItemsChange?: (items: OrderItem[]) => void;
}

export function OrderTable({ readOnly = false, onItemsChange }: OrderTableProps) {
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
    { key: 'name', label: 'Name', sortable: true, className: 'w-[22%]' },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true,
      className: `w-[10%]`
    })),
    { key: 'pallets', label: 'Qty', sortable: true, className: 'w-[8%]' },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, className: 'w-[10%]' },
    { key: 'totalCost', label: 'Total Cost', sortable: true, className: 'w-[10%]' },
    { key: 'actions', label: 'Actions', className: 'w-[10%]' }
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

  const AddRowButton = ({ fullWidth = false, text = "Add Row" }) => (
    <Button 
      onClick={handleAddItem}
      className={`bg-[#2A4131] hover:bg-[#2A4131]/90 ${fullWidth ? 'w-full' : ''}`}
    >
      <Plus className="mr-2 h-4 w-4" />
      {text}
    </Button>
  );

  const EmptyState = () => (
    <div className="text-center py-10 border rounded-md bg-gray-50">
      <p className="text-gray-500 mb-4">No items added yet</p>
      <AddRowButton text="Add Your First Row" />
    </div>
  );

  if (items.length === 0 && !readOnly) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="w-full p-4 md:p-6 lg:p-8">
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
          
          {!readOnly && (
            <div className="mt-4 flex justify-end">
              <AddRowButton />
            </div>
          )}
        </div>
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
          
          {!readOnly && (
            <div className="mt-4">
              <AddRowButton fullWidth={true} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
