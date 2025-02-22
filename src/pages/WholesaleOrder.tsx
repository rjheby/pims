
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus } from "lucide-react";

interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  dryness: string;
  packaging: string;
  pallets: number;
}

const SPECIES_OPTIONS = ["Mixed Hardwood", "Cherry", "Oak", "Hickory", "Ash"];
const LENGTH_OPTIONS = ["12\"", "16\""];
const BUNDLE_OPTIONS = ["Loose", "Bundled"];
const THICKNESS_OPTIONS = ["Standard Split", "Thick Split"];
const DRYNESS_OPTIONS = ["Kiln Dried"];
const PACKAGING_OPTIONS = ["Pallets"];

export default function WholesaleOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      dryness: "Kiln Dried",
      packaging: "Pallets",
      pallets: 0,
    },
  ]);

  const generateItemName = (item: OrderItem) => {
    if (!item.length || !item.species || !item.thickness) return "";
    const lengthPrefix = item.length === "12\"" ? "12\" " : "16\" ";
    return `${item.thickness} ${item.dryness} ${item.bundleType} ${lengthPrefix}${item.species}`;
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        id: items.length + 1,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        dryness: "Kiln Dried",
        packaging: "Pallets",
        pallets: 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const totalSummary = `${totalPallets} ${items[0]?.packaging || "Pallets"} in ${items[0]?.bundleType || "Loose"}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wholesale Order Form</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>New Wholesale Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="orderNumber" className="text-sm font-medium">Order #</label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="2502-1"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="orderDate" className="text-sm font-medium">Order Date</label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="deliveryDate" className="text-sm font-medium">Delivery Date</label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Bundled or Loose</TableHead>
                <TableHead>Thickness</TableHead>
                <TableHead>Dryness</TableHead>
                <TableHead>Packaging</TableHead>
                <TableHead>Pallets</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{generateItemName(item)}</TableCell>
                  <TableCell>
                    <Select value={item.species} onValueChange={(value) => updateItem(item.id, "species", value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIES_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={item.length} onValueChange={(value) => updateItem(item.id, "length", value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {LENGTH_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={item.bundleType} onValueChange={(value) => updateItem(item.id, "bundleType", value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUNDLE_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={item.thickness} onValueChange={(value) => updateItem(item.id, "thickness", value)}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {THICKNESS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={item.dryness} onValueChange={(value) => updateItem(item.id, "dryness", value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {DRYNESS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={item.packaging} onValueChange={(value) => updateItem(item.id, "packaging", value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGING_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.pallets || ""}
                      onChange={(e) => updateItem(item.id, "pallets", parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={7} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell colSpan={2}>
                  {totalSummary}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="flex justify-between">
            <Button onClick={addRow} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
            <Button>Submit Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
