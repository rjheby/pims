
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { useOrderTable } from "./hooks/useOrderTable";

export function OrderTable() {
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
    calculateTotalPallets,
    calculateTotalCost,
  } = useOrderTable();

  return (
    <div className="grid gap-4 overflow-x-auto">
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name</TableHead>
                  {optionFields.map((field) => (
                    <TableHead key={field} className="w-[160px]">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[100px]">Pallets</TableHead>
                  <TableHead className="w-[100px]">Cost</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
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
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="grid gap-4">
          {items.map((item) => (
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
