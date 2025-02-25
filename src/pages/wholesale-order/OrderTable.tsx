
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
    setNewOption
  } = useOrderTable();

  // Hide on smaller screens, show cards instead
  return <>
      <div className="hidden md:block overflow-x-auto">
        <style jsx>{`
          table {
            table-layout: fixed;
            width: 100%;
          }
          th, td {
            width: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}</style>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{
              width: '15%'
            }}>Name</TableHead>
              {optionFields.map(field => <TableHead key={field} style={{
              width: '12%'
            }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </TableHead>)}
              <TableHead style={{
              width: '8%'
            }}>Qty</TableHead>
              <TableHead style={{
              width: '8%'
            }}>Unit Cost
            </TableHead>
              <TableHead style={{
              width: '8%'
            }}>Total Cost</TableHead>
              <TableHead style={{
              width: '12%'
            }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => <OrderTableRow key={item.id} item={item} options={options} isAdmin={isAdmin} editingField={editingField} newOption={newOption} onNewOptionChange={setNewOption} onKeyPress={handleKeyPress} onUpdateItem={handleUpdateItem} onRemoveRow={handleRemoveRow} onCopyRow={handleCopyRow} onAddItem={handleAddItem} generateItemName={generateItemName} onUpdateOptions={handleUpdateOptions} isCompressed={!!compressedStates[item.id]} onToggleCompressed={toggleCompressed} />)}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        <div className="grid gap-4">
          {items.map(item => <OrderTableMobileRow key={item.id} item={item} options={options} isAdmin={isAdmin} editingField={editingField} newOption={newOption} isCompressed={!!compressedStates[item.id]} optionFields={optionFields} onNewOptionChange={setNewOption} onKeyPress={handleKeyPress} onUpdateItem={handleUpdateItem} onUpdateOptions={handleUpdateOptions} onRemoveRow={handleRemoveRow} onCopyRow={handleCopyRow} onAddItem={handleAddItem} onToggleCompressed={toggleCompressed} generateItemName={generateItemName} />)}
        </div>
      </div>
    </>;
}
