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
import { Plus, Minus, Copy } from "lucide-react";

interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
}

interface DropdownOptions {
  species: string[];
  length: string[];
  bundleType: string[];
  thickness: string[];
  packaging: string[];
}

const initialOptions: DropdownOptions = {
  species: ["Mixed Hardwood", "Cherry", "Oak", "Hickory", "Ash"],
  length: ["12\"", "16\""],
  bundleType: ["Loose", "Bundled"],
  thickness: ["Standard Split", "Thick Split"],
  packaging: ["Pallets"],
};

export default function WholesaleOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [newOption, setNewOption] = useState("");
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
    },
  ]);

  const generateItemName = (item: OrderItem) => {
    if (!item.length || !item.species || !item.thickness) return "";
    const lengthPrefix = item.length === "12\"" ? "12\" " : "16\" ";
    return `${item.thickness} ${item.bundleType} ${lengthPrefix}${item.species}`;
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
        packaging: "Pallets",
        pallets: 0,
      },
    ]);
  };

  const copyRow = (item: OrderItem) => {
    setItems([
      ...items,
      {
        ...item,
        id: items.length + 1,
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

  const addOptionToField = (field: keyof DropdownOptions) => {
    if (newOption && !options[field].includes(newOption)) {
      setOptions({
        ...options,
        [field]: [...options[field], newOption],
      });
      setNewOption("");
    }
  };

  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const totalSummary = `${totalPallets} ${items[0]?.packaging || "Pallets"} in ${items[0]?.bundleType || "Loose"}`;

  const generateOrderNumber = (date: string) => {
    if (!date) return "";
    
    const orderDate = new Date(date);
    const year = orderDate.getFullYear().toString().slice(-2);
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    
    // In a real application, you would fetch the last order number for this month from the backend
    // For now, we'll simulate it with a random number between 1 and 99
    const orderSequence = Math.floor(Math.random() * 99) + 1;
    
    return `${year}${month}-${orderSequence}`;
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    setOrderNumber(generateOrderNumber(newDate));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wholesale Order Form</h1>
        <Button 
          variant="ghost" 
          onClick={() => setIsAdmin(!isAdmin)}
          className={isAdmin ? "bg-red-100 hover:bg-red-200 text-red-700" : ""}
        >
          {isAdmin ? "Exit Admin Mode" : "Admin Mode"}
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Wholesale Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="orderNumber" className="text-sm font-medium">Order #</label>
              <Input
                id="orderNumber"
                value={orderNumber}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="orderDate" className="text-sm font-medium">Order Date</label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={handleOrderDateChange}
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Name</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Length</TableHead>
                  <TableHead>Bundled or Loose</TableHead>
                  <TableHead>Thickness</TableHead>
                  <TableHead>Packaging</TableHead>
                  <TableHead># of Units</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="w-1/4 min-w-[200px]">{generateItemName(item)}</TableCell>
                    <TableCell>
                      <div className="relative">
                        <Select value={item.species} onValueChange={(value) => updateItem(item.id, "species", value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.species.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAdmin && editingField === "species" && (
                          <div className="mt-2">
                            <Input
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              className="w-32 mb-1"
                              placeholder="New option"
                            />
                            <Button size="sm" onClick={() => addOptionToField("species")}>Add</Button>
                          </div>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingField(editingField === "species" ? null : "species")}
                            className="absolute -top-6 right-0 text-red-600 text-xs"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={item.length} onValueChange={(value) => updateItem(item.id, "length", value)}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.length.map((option) => (
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
                          {options.bundleType.map((option) => (
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
                          {options.thickness.map((option) => (
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
                          {options.packaging.map((option) => (
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(item.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyRow(item)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell colSpan={2}>
                    {totalSummary}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button 
              onClick={addRow} 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Row
            </Button>
            <Button className="bg-green-500 hover:bg-green-600">Submit Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
