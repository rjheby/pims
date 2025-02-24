
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Copy, X } from "lucide-react";
import { SheetItem, SheetProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Sheet<T extends SheetItem>({
  items,
  columns,
  summaries,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onCopyItem,
  isAdmin = false,
  addItemLabel = "Add Item"
}: SheetProps<T>) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Sheet</CardTitle>
          {onAddItem && (
            <Button
              onClick={onAddItem}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addItemLabel}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.field)}
                      className={column.width ? `w-[${column.width}]` : ''}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={`${item.id}-${String(column.field)}`}>
                        {column.render ? column.render(item) : String(item[column.field] || '')}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex gap-2">
                        {onRemoveItem && (
                          <Button
                            variant="customAction"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            className="rounded-full w-8 h-8 p-0 text-pink-100 bg-red-800 hover:bg-pink-100 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {onCopyItem && (
                          <Button
                            variant="customAction"
                            size="sm"
                            onClick={() => onCopyItem(item)}
                            className="rounded-full w-8 h-8 p-0 text-sky-100 bg-blue-700 hover:bg-sky-100 hover:text-blue-700"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {summaries && summaries.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                {summaries.map((summary, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{summary.label}:</span>
                      <span className="font-medium">
                        {summary.format
                          ? summary.format(summary.calculate(items))
                          : summary.calculate(items)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
