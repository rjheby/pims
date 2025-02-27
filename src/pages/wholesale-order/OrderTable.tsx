
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { useOrderTable } from "./hooks/useOrderTable";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { OrderItem } from "./types";
import { useEffect } from "react";

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

  // Call the onItemsChange callback whenever items change
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const headers = [
    { key: 'name', label: 'Name', sortable: true },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true
    })),
    { key: 'pallets', label: 'Qty', sortable: true },
    { key: 'unitCost', label: 'Unit Cost', sortable: true },
    { key: 'totalCost', label: 'Total Cost', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = items.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: (item.pallets || 0) * (item.unitCost || 0)
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
        <div className="overflow-x-auto w-full" style={{width: '100%'}}>
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
                onKeyPress={handleKeyPress}
                onUpdateItem={handleUpdateItem}
                onRemoveRow={handleRemoveRow}
                onCopyRow={handleCopyRow}
                onAddItem={handleAddItem}
                generateItemName={generateItemName}
                onUpdateOptions={handleUpdateOptions}
                isCompressed={!!compressedStates[item.id]}
                onToggleCompressed={toggleCompressed}
                readOnly={readOnly}
              />
            ))}
          </BaseOrderTable>
        </div>
      </div>

      <div className="md:hidden">
        <div className="grid gap-4">
          {items.map(item => (
            <OrderTableMobileRow
              key={item.id}
              item={item}
              options={options}
              isAdmin={isAdmin}
              editingField={editingField}
              newOption={newOption}
              isCompressed={!!compressedStates[item.id]}
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
        </div>
      </div>
    </>
  );
}
