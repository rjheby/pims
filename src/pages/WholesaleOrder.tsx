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
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [newOption, setNewOption] = useState("");
  const [editingFields, setEditingFields] = useState<Set<keyof DropdownOptions>>(new Set());
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
    const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
    const newPallets = 0; // Default for new row

    if (totalPallets + newPallets > 24) {
      toast({
        title: "Warning",
        description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
        variant: "destructive",
      });
      return;
    }

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
    if (field === "pallets") {
      const currentTotal = items.reduce((sum, item) => sum + (item.id === id ? 0 : (item.pallets || 0)), 0);
      const newValue = parseInt(value as string) || 0;
      
      if (currentTotal + newValue > 24) {
        toast({
          title: "Warning",
          description: "This would exceed the 24-pallet limit for a tractor trailer.",
          variant: "destructive",
        });
        return;
      }
    }

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

  const toggleFieldEditing = (field: keyof DropdownOptions) => {
    setEditingFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  const generateOrderNumber = (date: string) => {
    if (!date) return "";
    
    const orderDate = new Date(date);
    const year = orderDate.getFullYear().toString().slice(-2);
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    
    // In a real application, this would be fetched from the backend
    // For now, we'll always use 01 as it's a new order
    const orderSequence = "01";
    
    return `${year}${month}-${orderSequence}`;
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    setOrderNumber(generateOrderNumber(newDate));
  };

  const handleSubmit = async () => {
    // Create reference for PDF content
    const orderElement = document.getElementById('order-content');
    if (!orderElement) return;

    try {
      // Generate PDF
      const canvas = await html2canvas(orderElement);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WholesaleOrder-${orderNumber}.pdf`);

      toast({
        title: "Success",
        description: "Order has been processed and PDF has been downloaded.",
      });

      // Here we would also implement email sending functionality
      // This would typically be handled by a backend service
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);
  const totalSummary = `${totalPallets} ${items[0]?.packaging || "Pallets"} in ${items[0]?.bundleType || "Loose"}`;

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
          <div id="order-content">
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
                          {isAdmin && editingFields.has("species") && (
                            <div className="absolute left-36 top-0 z-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
                              <Input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                className="mb-2"
                                placeholder="New option"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => addOptionToField("species")}>
                                  Add Option
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => toggleFieldEditing("species")}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFieldEditing("species")}
                              className="absolute -top-6 right-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600"
                            >
                              Edit Options
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
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
                          {isAdmin && editingFields.has("length") && (
                            <div className="absolute left-28 top-0 z-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
                              <Input
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                className="mb-2"
                                placeholder="New option"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => addOptionToField("length")}>
                                  Add Option
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => toggleFieldEditing("length")}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFieldEditing("length")}
                              className="absolute -top-6 right-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600"
                            >
                              Edit Options
                            </Button>
                          )}
                        </div>
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
              <Button 
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600"
                disabled={totalPallets === 0}
              >
                Submit Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
