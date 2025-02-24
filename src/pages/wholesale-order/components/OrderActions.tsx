
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GeneratedOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  url: string;
}

export function OrderActions() {
  const { items, setItems, orderNumber, orderDate } = useWholesaleOrder();
  const { toast } = useToast();
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
      },
    ]);
  };

  const handleSubmit = () => {
    try {
      // Create URL parameters from current state
      const orderContent = {
        orderNumber,
        orderDate,
        items,
      };
      
      // Create a Base64 encoded string of the order content
      const encodedContent = btoa(JSON.stringify(orderContent));
      const url = `/generated-order/${encodedContent}`;
      
      // Add to generated orders list
      const newOrder: GeneratedOrder = {
        id: Date.now().toString(),
        orderNumber,
        orderDate,
        url,
      };
      
      setGeneratedOrders(prev => [newOrder, ...prev]);

      // Open in new tab
      window.open(url, '_blank');

      toast({
        title: "Success",
        description: "Order has been generated and opened in a new tab.",
      });

    } catch (error) {
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
                  <div className="font-medium">Order #{order.orderNumber}</div>
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
