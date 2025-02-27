
import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Save, SendHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { OrderItem, serializeOrderItems } from "./wholesale-order/types";
import { useToast } from "@/hooks/use-toast";
import { BaseOrderDetails } from "@/components/templates/BaseOrderDetails";
import { OrderTable } from "./wholesale-order/OrderTable";
import { WholesaleOrderProvider } from "./wholesale-order/context/WholesaleOrderContext";
import { BaseOrderSummary } from "@/components/templates/BaseOrderSummary";

// Database type that represents the actual schema
interface DatabaseOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string | null;
  items: unknown; // This could be a string or JSON object
  admin_editable: boolean | null;
  created_at: string | null;
  order_name: string | null;
  // status and submitted_at might be missing from the database
}

// Application type that we use in our component
interface WholesaleOrderData {
  id: string;
  order_number: string;
  order_date: string;
  delivery_date: string;
  items: OrderItem[];
  // Status is tracked separately
}

export function WholesaleOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<WholesaleOrderData | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('draft');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryItems, setSummaryItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    async function fetchOrderData() {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Type cast data to access potential status field safely
          const rawData = data as any;
          
          // Parse items whether it's a string or already an object
          const parsedItems = typeof rawData.items === 'string' 
            ? JSON.parse(rawData.items) 
            : rawData.items;
          
          // Create our application model
          setOrderData({
            id: rawData.id,
            order_number: rawData.order_number,
            order_date: rawData.order_date,
            delivery_date: rawData.delivery_date || '',
            items: parsedItems,
          });
          
          // Also update the summary items
          setSummaryItems(parsedItems);
          
          // Check if status exists before trying to use it
          if ('status' in rawData && rawData.status) {
            setOrderStatus(rawData.status);
          }
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        order_date: e.target.value
      }));
    }
  };

  const handleDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        delivery_date: e.target.value
      }));
    }
  };

  const calculateTotalPallets = (items: OrderItem[]) => {
    if (!items?.length) return 0;
    return items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  };

  const calculateTotalCost = (items: OrderItem[]) => {
    if (!items?.length) return 0;
    return items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  };

  // Calculate the quantity breakdown by species
  const calculateQuantityBySpecies = (items: OrderItem[]) => {
    if (!items?.length) return {};
    
    const speciesMap: Record<string, number> = {};
    
    items.forEach((item) => {
      if (item.species && item.pallets) {
        const species = item.species;
        speciesMap[species] = (speciesMap[species] || 0) + Number(item.pallets);
      }
    });
    
    return speciesMap;
  };

  const validateOrder = () => {
    if (!orderData?.order_date) {
      throw new Error("Order date is required");
    }

    const validItems = orderData.items.filter(item => 
      item.species && item.length && item.bundleType && item.thickness && Number(item.pallets) > 0
    );
    
    if (validItems.length === 0) {
      throw new Error("At least one valid item is required with all fields filled");
    }

    return true;
  };

  const handleSave = async () => {
    if (!orderData || isSaving) return;
    
    setIsSaving(true);
    try {
      validateOrder();

      // Create update object dynamically to avoid TypeScript errors
      const updateData: Record<string, any> = {
        order_date: orderData.order_date,
        items: serializeOrderItems(orderData.items),
        status: 'draft'
      };
      
      // Only set delivery_date if it has a value to avoid empty string issues
      if (orderData.delivery_date && orderData.delivery_date.trim() !== '') {
        updateData.delivery_date = orderData.delivery_date;
      } else {
        // If delivery_date is empty, set it to null explicitly
        updateData.delivery_date = null;
      }

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update the summary items with the latest data
      setSummaryItems([...orderData.items]);

      toast({
        title: "Success",
        description: "Order draft saved successfully",
      });
    } catch (err: any) {
      console.error('Error saving order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save order",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!orderData || isSubmitting) return;

    const totalPallets = calculateTotalPallets(orderData.items);
    
    if (totalPallets > 24) {
      toast({
        title: "Warning",
        description: `Order exceeds maximum load by ${totalPallets - 24} pallets. Consider reducing the pallet count.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      validateOrder();

      // Create update object dynamically to avoid TypeScript errors
      const updateData: Record<string, any> = {
        order_date: orderData.order_date,
        items: serializeOrderItems(orderData.items),
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };
      
      // Only set delivery_date if it has a value to avoid empty string issues
      if (orderData.delivery_date && orderData.delivery_date.trim() !== '') {
        updateData.delivery_date = orderData.delivery_date;
      } else {
        // If delivery_date is empty, set it to null explicitly
        updateData.delivery_date = null;
      }

      const { error: updateError } = await supabase
        .from('wholesale_orders')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state regardless of database schema
      setOrderStatus('submitted');
      
      // Update the summary items with the latest data
      setSummaryItems([...orderData.items]);

      toast({
        title: "Success",
        description: "Order submitted successfully",
      });

      navigate('/wholesale-orders');
    } catch (err: any) {
      console.error('Error submitting order:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemsChanged = (items: OrderItem[]) => {
    // Update summary immediately when items change in the OrderTable
    setSummaryItems(items);
    
    // Also update the main orderData
    if (orderData) {
      setOrderData(prev => ({
        ...prev!,
        items
      }));
    }
  };

  const renderCustomSummary = () => {
    const totalPallets = calculateTotalPallets(summaryItems);
    
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        {totalPallets < 24 && (
          <div className="text-sm text-amber-600 text-center">
            {24 - totalPallets} pallets remaining before full load
          </div>
        )}
        {totalPallets > 24 && (
          <div className="text-sm text-red-600 text-center">
            Exceeds maximum load by {totalPallets - 24} pallets
          </div>
        )}
        {totalPallets === 24 && (
          <div className="text-sm text-green-600 text-center">
            Perfect load! Exactly 24 pallets.
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-red-500">{error}</div>
    </div>
  );

  if (!orderData) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-gray-500">Order not found</div>
    </div>
  );

  const totalPallets = calculateTotalPallets(summaryItems);
  const totalCost = calculateTotalCost(summaryItems);
  const quantityBySpecies = calculateQuantityBySpecies(summaryItems);

  const isSubmitted = orderStatus === 'submitted';

  return (
    <div className="flex-1">
      <div>
        <div className="flex justify-center md:justify-start mb-4">
          <img 
            src="/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png"
            alt="Woodbourne Logo"
            className="h-8 md:h-12 w-auto"
          />
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Supplier Order #{orderData?.order_number}</CardTitle>
              {isSubmitted && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <BaseOrderDetails
                orderNumber={orderData.order_number}
                orderDate={orderData.order_date}
                deliveryDate={orderData.delivery_date}
                onOrderDateChange={handleOrderDateChange}
                onDeliveryDateChange={handleDeliveryDateChange}
                disabled={false}
              />
              
              <WholesaleOrderProvider 
                initialItems={orderData.items}
                onItemsChanged={handleItemsChanged}
              >
                <OrderTable readOnly={false} />
              </WholesaleOrderProvider>

              <BaseOrderSummary 
                items={{
                  totalQuantity: totalPallets,
                  totalValue: totalCost,
                  quantityByPackaging: { 
                    'Total Pallets': totalPallets,
                    ...quantityBySpecies  // Include quantity by species
                  }
                }}
                renderCustomSummary={renderCustomSummary}
              />

              <div className="flex flex-col space-y-4">
                <div className="flex justify-end gap-4">
                  <Button 
                    onClick={handleSave} 
                    className="bg-gray-600 hover:bg-gray-700"
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                  >
                    <SendHorizontal className="mr-2 h-4 w-4" />
                    {isSubmitted ? "Resubmit Order" : "Submit Order"}
                  </Button>
                </div>
                
                <div className="flex justify-center pt-6 border-t">
                  <Button
                    asChild
                    className="bg-[#f1e8c7] text-[#222222] hover:bg-[#f1e8c7]/90"
                  >
                    <Link to="/wholesale-orders" className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      <span>View All Orders</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
