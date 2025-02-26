
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BaseOrderTableProps {
  children: React.ReactNode;
  headers: { key: string; label: string }[];
}

export function BaseOrderTable({ children, headers }: BaseOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header.key}>{header.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {children}
        </TableBody>
      </Table>
    </div>
  );
}
