import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    hasOrderNumber: !!orderNumber,
    hasOrderDate: !!orderDate,
    itemsCount: items.length,
    hasValidItems: false
  });
  
  // Recalculate total pallets more safely
  const totalPallets = items.reduce((sum, item) => {
    const pallets = Number(item.pallets) || 0;
    return sum + pallets;
  }, 0);

  // Calculate total cost from all items (Quantity * Unit Cost for each item)
  const totalCost = items.reduce((sum, item) => {
    const itemTotal = (Number(item.pallets) || 0) * (Number(item.unitCost) || 0);
    return sum + itemTotal;
  }, 0);

  // Check if there's at least one valid item
  const hasValidItems = items.some(item => {
    const isValid = item.species && 
                   item.length && 
                   item.bundleType && 
                   item.thickness && 
                   item.pallets > 0;
    
    return isValid;
  });

  // Update debug info when dependencies change
  useEffect(() => {
    setDebugInfo({
      hasOrderNumber: !!orderNumber,
      hasOrderDate: !!orderDate,
      itemsCount: items.length,
      hasValidItems
    });
  }, [orderNumber, orderDate, items, hasValidItems]);

  const addItem = () => {
    const newTotalPallets = totalPallets + 1;
    console.log('Current total pallets:', totalPallets, 'New total would be:', newTotalPallets);
    
    // Show appropriate warning based on pallet count
    if (newTotalPallets > 24) {
      toast({
        title: "Warning",
        description: "Shipment may already be full.",
        variant: "destructive",
      });
    } else if (newTotalPallets < 24) {
      toast({
        title: "Notice",
        description: "Shipment is not quite full. Consider adding more product to this order.",
        variant: "default",
      });
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
        unitCost: 250,
      },
    ]);
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    setIsSubmitting(true);
    
    try {
      if (!orderNumber || !orderDate) {
        console.log("Missing required fields:", { orderNumber, orderDate });
        toast({
          title: "Error",
          description: "Order number and date are required.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Items before validation:', items);

      const validItems = items.filter(item => {
        const isValid = item.species && 
                      item.length && 
                      item.bundleType && 
                      item.thickness && 
                      item.pallets > 0;
        
        if (!isValid) {
          console.log('Invalid item:', {
            id: item.id,
            species: !!item.species,
            length: !!item.length,
            bundleType: !!item.bundleType,
            thickness: !!item.thickness,
            pallets: item.pallets > 0
          });
        }
        
        return isValid;
      });

      console.log('Valid items:', validItems);

      if (validItems.length === 0) {
        console.log("No valid items found");
        toast({
          title: "Error",
          description: "At least one valid item is required. All fields must be filled and quantities must be greater than 0.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Attempting to save to Supabase");
      
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
          description: "Failed to generate wholesale order: " + error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Order saved successfully:", data);

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
      console.log("Navigating to:", url);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !hasValidItems || !orderNumber || !orderDate;

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
        <div className="flex flex-col">
          <Button 
            onClick={handleSubmit}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
          {isButtonDisabled && (
            <div className="text-xs text-red-500 mt-1">
              {!orderNumber && "Order number required. "}
              {!orderDate && "Order date required. "}
              {!hasValidItems && "At least one complete item required."}
            </div>
          )}
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="text-xs bg-gray-100 p-2 rounded">
        <div>Order Number: {orderNumber || "missing"}</div>
        <div>Order Date: {orderDate || "missing"}</div>
        <div>Items Count: {items.length}</div>
        <div>Has Valid Items: {hasValidItems ? "Yes" : "No"}</div>
        <div>Button Disabled: {isButtonDisabled ? "Yes" : "No"}</div>
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

      {/* Order Summary Section */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-6 text-center">Order Summary</h3>
        <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-1">Total Pallets</div>
            <div className="text-2xl font-semibold">{totalPallets}</div>
            {totalPallets < 24 && (
              <div className="text-sm text-amber-600 mt-1">
                {24 - totalPallets} pallets remaining before full load
              </div>
            )}
            {totalPallets > 24 && (
              <div className="text-sm text-red-600 mt-1">
                Exceeds maximum load by {totalPallets - 24} pallets
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-1">Total Order Value</div>
            <div className="text-2xl font-semibold">
              ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
