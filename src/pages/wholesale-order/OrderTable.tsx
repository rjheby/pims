
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { useOrderTable } from "./hooks/useOrderTable";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { OrderItem, safeNumber, calculateItemTotal } from "./types";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
    compressedStates,
    optionFields,
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    generateItemName,
    handleUpdateOptions,
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

  const headers = [
    { key: 'name', label: 'Name', sortable: true, className: 'w-[250px]' },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true,
      className: 'w-[150px]'
    })),
    { key: 'pallets', label: 'Qty', sortable: true, className: 'w-[100px]' },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, className: 'w-[150px]' },
    { key: 'totalCost', label: 'Total Cost', sortable: true, className: 'w-[150px]' },
    { key: 'actions', label: 'Actions', className: 'w-[150px]' }
  ];

  const tableData = items.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: calculateItemTotal(item.pallets, item.unitCost)
  }));

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filter: string) => {
    setFilterValue(filter);
  };

  return (
    <>
      <div className="hidden md:block">
        <div className="w-full p-4 md:p-6 lg:p-8 overflow-visible">
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
                onKeyPress={(e) => handleKeyPress(e, editingField)}
                onUpdateItem={handleUpdateItem}
                onRemoveRow={handleRemoveRow}
                onCopyRow={handleCopyRow}
                onAddItem={handleAddItem}
                generateItemName={generateItemName}
                onUpdateOptions={handleUpdateOptions}
                isCompressed={false}
                onToggleCompressed={toggleCompressed}
                readOnly={readOnly}
              />
            ))}
          </BaseOrderTable>
          
          {!readOnly && (
            <div className="mt-4 flex justify-between">
              <div></div> {/* Empty div to create space on left side */}
              <Button 
                onClick={handleAddItem}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      </div>

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
              onKeyPress={handleKeyPress}
              onUpdateItem={handleUpdateItem}
              onUpdateOptions={handleUpdateOptions}
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
              <Button 
                onClick={handleAddItem}
                className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {items.length === 0 && !readOnly && (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-4">No items added yet</p>
          <Button 
            onClick={handleAddItem}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Row
          </Button>
        </div>
      )}
    </>
  );
}
