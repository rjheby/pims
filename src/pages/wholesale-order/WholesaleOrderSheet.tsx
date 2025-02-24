import { Sheet } from "@/components/sheets/Sheet";
import { OrderItem } from "./types";
import { useWholesaleOrder } from "./context/WholesaleOrderContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function WholesaleOrderSheet() {
  const { items, options, setItems, isAdmin, orderNumber, orderDate } = useWholesaleOrder();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdateItem = (id: number, field: keyof OrderItem, value: any) => {
    setItems(prev => 
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    const maxId = Math.max(...items.map(item => item.id), 0);
    setItems([...items, {
      id: maxId + 1,
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "Pallets",
      pallets: 0,
      unitCost: 250
    }]);
  };

  const handleSubmit = async () => {
    if (!orderNumber || !orderDate) {
      toast({
        title: "Error",
        description: "Order number and date are required.",
        variant: "destructive",
      });
      return;
    }

    const validItems = items.filter(item => {
      const isValid = item.species && 
                     item.length && 
                     item.bundleType && 
                     item.thickness && 
                     item.pallets > 0;
      return isValid;
    });

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "At least one valid item is required. All fields must be filled and quantities must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wholesale_orders")
        .insert([{
          order_number: orderNumber,
          order_date: new Date(orderDate).toISOString(),
          items: JSON.stringify(validItems),
          admin_editable: true
        }])
        .select("id")
        .single();

      if (error) {
        console.error("Error saving wholesale order:", error);
        toast({
          title: "Error",
          description: "Failed to generate wholesale order.",
          variant: "destructive",
        });
        return;
      }

      // Navigate to the locked wholesale order form page
      navigate(`/wholesale-order-form/${data.id}`);

      toast({
        title: "Success",
        description: "Wholesale order generated successfully.",
      });

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to generate the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      field: 'species' as keyof OrderItem,
      header: 'Species',
      render: (item: OrderItem) => (
        <Select value={item.species} onValueChange={(value) => handleUpdateItem(item.id, 'species', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select species" />
          </SelectTrigger>
          <SelectContent>
            {options.species.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
  ];

  const summaries = [
    {
      label: 'Total Pallets',
      calculate: (items: OrderItem[]) => items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0),
    },
    {
      label: 'Total Cost',
      calculate: (items: OrderItem[]) => items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0),
      format: (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  ];

  return (
    <div className="space-y-4">
      <Sheet
        items={items}
        columns={columns}
        summaries={summaries}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={(id) => setItems(items.filter(item => item.id !== id))}
        onCopyItem={(item) => setItems([...items, { ...item, id: Math.max(...items.map(i => i.id), 0) + 1 }])}
        isAdmin={isAdmin}
        addItemLabel="Add Product"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
        >
          Submit Order
        </Button>
      </div>
    </div>
  );
}
