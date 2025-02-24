
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderItem } from "./wholesale-order/types";

export function GeneratedOrder() {
  const { encodedContent } = useParams();
  
  if (!encodedContent) {
    return <div>No order content found</div>;
  }

  try {
    const decodedContent = JSON.parse(atob(encodedContent));
    const { orderNumber, orderDate, items } = decodedContent;

    const generateItemName = (item: OrderItem) => {
      if (!item.length || !item.species || !item.thickness) return "";
      const lengthPrefix = item.length === "12\"" ? "12\" " : "16\" ";
      return `${item.thickness} ${item.bundleType} ${lengthPrefix}${item.species}`;
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Wholesale Order #{orderNumber}</CardTitle>
            <div className="text-sm text-gray-500">Order Date: {orderDate}</div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Bundle Type</TableHead>
                  <TableHead>Thickness</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead>Pallets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: OrderItem) => (
                  <TableRow key={item.id}>
                    <TableCell>{generateItemName(item)}</TableCell>
                    <TableCell>{item.species}</TableCell>
                    <TableCell>{item.length}</TableCell>
                    <TableCell>{item.bundleType}</TableCell>
                    <TableCell>{item.thickness}</TableCell>
                    <TableCell>{item.packaging}</TableCell>
                    <TableCell>{item.pallets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return <div>Error loading order content</div>;
  }
}

