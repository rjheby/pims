import { useState, useEffect, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { OrderDetails } from "./wholesale-order/OrderDetails";
import { AdminControls } from "./wholesale-order/AdminControls";
import { OrderTable } from "./wholesale-order/OrderTable";
import { OrderItem, DropdownOptions, initialOptions } from "./wholesale-order/types";

export default function WholesaleOrder() {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [options, setOptions] = useState<DropdownOptions>(initialOptions);
  const [optionsHistory, setOptionsHistory] = useState<DropdownOptions[]>([initialOptions]);
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [newOption, setNewOption] = useState("");
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAdminToggle = () => {
    if (isAdmin && hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Do you want to save them before exiting admin mode?')) {
        saveChanges();
      } else {
        discardChanges();
      }
    } else {
      setIsAdmin(!isAdmin);
    }
  };

  const saveChanges = () => {
    setOptionsHistory([...optionsHistory, options]);
    setHasUnsavedChanges(false);
    setIsAdmin(false);
    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const discardChanges = () => {
    setOptions(optionsHistory[optionsHistory.length - 1]);
    setHasUnsavedChanges(false);
    setIsAdmin(false);
    setEditingField(null);
    toast({
      title: "Changes discarded",
      description: "Your changes have been discarded.",
    });
  };

  const undoLastChange = () => {
    if (optionsHistory.length > 1) {
      const previousOptions = optionsHistory[optionsHistory.length - 2];
      setOptions(previousOptions);
      setOptionsHistory(optionsHistory.slice(0, -1));
      toast({
        title: "Change undone",
        description: "The last change has been undone.",
      });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>, field: keyof DropdownOptions) => {
    if (e.key === 'Enter' && newOption.trim()) {
      if (!options[field].includes(newOption.trim())) {
        const updatedOptions = {
          ...options,
          [field]: [...options[field], newOption.trim()],
        };
        setOptions(updatedOptions);
        setHasUnsavedChanges(true);
        setNewOption("");
        toast({
          title: "Option added",
          description: `Added "${newOption}" to ${field}`,
        });
      }
    }
  };

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

  const generateOrderNumber = (date: string) => {
    if (!date) return "";
    const orderDate = new Date(date);
    const year = orderDate.getFullYear().toString().slice(-2);
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    const orderSequence = "01";
    return `${year}${month}-${orderSequence}`;
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setOrderDate(newDate);
    setOrderNumber(generateOrderNumber(newDate));
  };

  const handleSubmit = async () => {
    const orderElement = document.getElementById('order-content');
    if (!orderElement) return;

    try {
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

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wholesale Order Form</h1>
        <AdminControls 
          isAdmin={isAdmin}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={saveChanges}
          onDiscard={discardChanges}
          onUndo={undoLastChange}
          onToggleAdmin={handleAdminToggle}
          canUndo={optionsHistory.length > 1}
        />
      </div>
      
      <Card className={cn(
        "transition-all duration-1000",
        isAdmin && "bg-red-50/5"
      )}>
        <CardHeader>
          <CardTitle>New Wholesale Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div id="order-content">
            <OrderDetails 
              orderNumber={orderNumber}
              orderDate={orderDate}
              deliveryDate={deliveryDate}
              onOrderDateChange={handleOrderDateChange}
              onDeliveryDateChange={(e) => setDeliveryDate(e.target.value)}
            />

            <div className="overflow-x-auto">
              <OrderTable 
                items={items}
                options={options}
                isAdmin={isAdmin}
                editingField={editingField}
                newOption={newOption}
                onNewOptionChange={setNewOption}
                onKeyPress={handleKeyPress}
                onEditField={setEditingField}
                onUpdateItem={updateItem}
                onRemoveRow={removeRow}
                onCopyRow={copyRow}
                generateItemName={generateItemName}
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button 
                onClick={addRow} 
                className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Row
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300"
                disabled={totalPallets === 0}
              >
                Submit Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={cn(
        "fixed inset-0 pointer-events-none transition-all duration-1000",
        isAdmin 
          ? "bg-red-500/5" 
          : "bg-transparent"
      )} />
    </div>
  );
}
