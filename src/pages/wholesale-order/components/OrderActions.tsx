import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  url: string;
}

export function OrderActions() {
  const { items, setItems, orderNumber, orderDate } = useWholesaleOrder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generatedOrders, setGeneratedOrders] = useState<GeneratedOrder[]>([]);
  
  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);

  const addItem = () => {
    if (totalPallets + 0 > 24) {
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
        quantity: 0,
      },
    ]);
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

    const validItems = items.filter(item =>
      item.species && item.length && item.bundleType && 
      item.thickness && item.pallets > 0 && item.quantity > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "At least one valid item is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wholesale_orders")
        .insert([
          {
            order_number: orderNumber,
            order_date: new Date(orderDate).toISOString(), // Ensure correct date format
            items: JSON.stringify(validItems), // Convert items to a JSON string
            admin_editable: true
          }
        ])
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

      // Generate the shareable URL
      const url = `/wholesale-order-form/${data.id}`;

      // Add to generated orders list
      const newOrder: GeneratedOrder = {
        id: data.id,
        orderNumber,
        orderDate,
        url,
      };

      setGeneratedOrders(prev => [newOrder, ...prev]);

      // Navigate to the locked wholesale order form page
      navigate(url);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button 
          onClick={addItem} 
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Item
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
          disabled={totalPallets === 0}
        >
          Submit Order
        </Button>
      </div>

      {generatedOrders.length > 0 && (
        <div className="border-t pt-6">
