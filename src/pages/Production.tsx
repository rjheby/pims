
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Production() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Production Tracker</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Production</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Produced</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Product A</TableCell>
                <TableCell>1000</TableCell>
                <TableCell>890</TableCell>
                <TableCell>In Progress</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
