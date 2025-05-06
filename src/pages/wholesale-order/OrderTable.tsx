
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { Button } from "@/components/ui/button";
import { useWholesaleOrder } from "./context/WholesaleOrderContext";
import { useOrderActions } from "./hooks/orderTable/useOrderActions";
import { OrderItem, DropdownOptions, generateEmptyOrderItem } from "./types";
import { useToast } from "@/hooks/use-toast";
import { ProductSelectorDialog } from "./components/ProductSelectorDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrderTableProps {
  readOnly?: boolean;
  onItemsChange?: (items: OrderItem[]) => void;
}

export function OrderTable({ readOnly = false, onItemsChange }: OrderTableProps) {
  const { toast } = useToast();
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const isMobile = useIsMobile();
  
  const {
    items,
    options,
    editingField,
    editingRowId,
    newOption,
    setNewOption,
    setEditingRowId,
    isAdmin,
    loadOptions,
    isLoadingOptions
  } = useWholesaleOrder();

  // Load options from Supabase when component mounts
  useEffect(() => {
    console.log('OrderTable mounted, loading options from Supabase');
    loadOptions();
  }, [loadOptions]);

  const {
    handleUpdateItemValue,
    handleAddItem,
    handleRemoveItem,
    handleDuplicateItem,
    handleOptionChange,
    handleKeyPressOnNewOption,
    handleUpdateOptions,
    handleStartEditing
  } = useOrderActions();

  const optionFields = Object.keys(options) as Array<keyof DropdownOptions>;

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  const generateItemName = (item: OrderItem): string => {
    return [item.species, item.length, item.bundleType, item.thickness]
      .filter(Boolean)
      .join(' - ') || 'New Item';
  };

  const handleUpdateItem = (item: OrderItem) => {
    handleUpdateItemValue(item.id, 'all', item);
  };

  const handleRemoveRow = (id: number) => {
    handleRemoveItem(id);
  };

  const handleCopyRow = (item: OrderItem) => {
    handleDuplicateItem(item.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleKeyPressOnNewOption(e);
  };

  const handleStartEditingField = (field: keyof DropdownOptions, rowId: number) => {
    handleStartEditing(rowId, field);
  };

  const toggleCompressed = (id: number) => {
    console.log('Toggle compressed for item', id);
  };

  const addNewEmptyRow = () => {
    console.log('Adding new empty row');
    const newItem = generateEmptyOrderItem();
    handleAddItem(newItem);
  };

  const openProductSelector = () => {
    console.log('Opening product selector dialog');
    setProductSelectorOpen(true);
  };

  const headers = [
    { key: 'name', label: 'Name', sortable: true, className: 'w-[15%] text-center px-4' },
    ...optionFields.map(field => ({
      key: field as string,
      label: typeof field === 'string' ? field.charAt(0).toUpperCase() + field.slice(1) : String(field),
      sortable: true,
      className: 'w-[12%] text-center px-2'
    })),
    { key: 'pallets', label: 'QTY', sortable: true, className: 'w-[8%] text-center px-2' },
    { key: 'unitCost', label: 'Unit Cost', sortable: true, className: 'w-[10%] text-center px-2' },
    { key: 'totalCost', label: 'Total Cost', sortable: true, className: 'w-[10%] text-center px-2' },
    { key: 'actions', label: '', className: 'w-[5%] text-center px-2' }
  ];

  const tableData = items.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: Number(item.pallets) * Number(item.unitCost)
  }));

  if (isLoadingOptions) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-gray-500 mb-4">Loading options from database...</p>
      </div>
    );
  }

  if (items.length === 0 && !readOnly) {
    return (
      <div className="text-center py-10 border rounded-md bg-gray-50">
        <p className="text-gray-500 mb-4">No items added yet</p>
        <div className="flex justify-center gap-4">
          <Button 
            onClick={addNewEmptyRow}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Empty Row
          </Button>
          <Button 
            onClick={openProductSelector}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-between mb-4">
          <Button 
            onClick={addNewEmptyRow}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            disabled={readOnly}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Empty Row
          </Button>
          
          <Button 
            onClick={openProductSelector}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            disabled={readOnly}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>
      )}
      
      <ProductSelectorDialog
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        onSelect={handleAddItem}
      />
      
      <div className="hidden md:block">
        <BaseOrderTable
          headers={headers}
          data={tableData}
          onSortChange={(key, direction) => setSortConfig({ key, direction })}
          onFilterChange={setFilterValue}
          onAddRow={addNewEmptyRow}
        >
          {tableData.map(item => (
            <OrderTableRow
              key={item.id}
              item={item}
              options={options}
              isAdmin={isAdmin}
              editingField={editingField}
              editingRowId={editingRowId}
              newOption={newOption}
              onNewOptionChange={setNewOption}
              onKeyPress={handleKeyPress}
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

      <div className="md:hidden w-full">
        <div className="grid gap-4 w-full">
          {items.map(item => (
            <OrderTableMobileRow
              key={item.id}
              item={item}
              options={options}
              isAdmin={isAdmin}
              editingField={editingField}
              editingRowId={editingRowId}
              newOption={newOption}
              isCompressed={false}
              optionFields={optionFields as string[]}
              onNewOptionChange={setNewOption}
              onKeyPress={handleKeyPress}
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
