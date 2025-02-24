
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem } from "../types";

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
  
  // Recalculate total pallets more safely
  const totalPallets = items.reduce((sum, item) => {
    // Convert to number and handle NaN
    const pallets = Number(item.pallets) || 0;
    return sum + pallets;
  }, 0);

  // Check if there's at least one valid item with detailed logging
  const hasValidItems = items.some(item => {
    const isValid = item.species && 
                   item.length && 
                   item.bundleType && 
                   item.thickness && 
                   item.pallets > 0 && 
                   item.quantity > 0;
    
    return isValid;
  });

  const addItem = () => {
    const newTotalPallets = totalPallets + 1; // Account for the new item's pallet
    console.log('Current total pallets:', totalPallets, 'New total would be:', newTotalPallets);
    
    if (newTotalPallets > 24) {
      toast({
        title: "Warning",
        description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...items.map(item => item.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        packaging: "Pallets",
        pallets: 1,
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

    // Log items before validation
    console.log('Items before validation:', items);

    const validItems = items.filter(item => {
      const isValid = item.species && 
                     item.length && 
                     item.bundleType && 
                     item.thickness && 
                     item.pallets > 0 && 
                     item.quantity > 0;
      
      // Log validation details for each item
      if (!isValid) {
        console.log('Invalid item:', {
          id: item.id,
          species: !!item.species,
          length: !!item.length,
          bundleType: !!item.bundleType,
          thickness: !!item.thickness,
          pallets: item.pallets > 0,
          quantity: item.quantity > 0
        });
      }
      
      return isValid;
    });

    console.log('Valid items:', validItems);

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
        .insert({
          order_number: orderNumber,
          order_date: new Date(orderDate).toISOString(),
          items: JSON.stringify(validItems),
          admin_editable: true
        })
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
          disabled={totalPallets >= 24}
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Item
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
          disabled={!hasValidItems || !orderNumber || !orderDate}
        >
          Submit Order
        </Button>
      </div>

      {generatedOrders.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Generated Orders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedOrders.map((order) => (
              <a
                key={order.id}
                href={order.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FileText className="h-6 w-6 mr-3 text-[#2A4131]" />
                <div>
                  <div className="font-medium">{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">{order.orderDate}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
