
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRetailInventory } from "./wholesale-order/hooks/useRetailInventory";
import { useWholesaleInventory } from "./wholesale-order/hooks/useWholesaleInventory";
import { PackagedProductsTable } from "./inventory/components/PackagedProductsTable";
import { RawMaterialsTable } from "./inventory/components/RawMaterialsTable";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, supabaseTable } from "./wholesale-order/types";

export default function Inventory() {
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("packaged");
  const isAdmin = hasPermission('admin');
  
  const { 
    retailInventory, 
    firewoodProducts, 
    loading: retailLoading, 
    fetchRetailInventory, 
    adjustInventory 
  } = useRetailInventory();
  
  const {
    wholesaleInventory,
    woodProducts,
    loading: wholesaleLoading,
    fetchWholesaleInventory
  } = useWholesaleInventory();

  // Merge inventory with product details for display
  const packagesWithDetails = retailInventory.map(item => {
    const product = firewoodProducts.find(p => p.id === item.firewood_product_id);
    return {
      ...item,
      product
    };
  });

  const rawMaterialsWithDetails = wholesaleInventory.map(item => {
    const product = woodProducts.find(p => p.id === item.wood_product_id);
    return {
      ...item,
      product
    };
  });

  const adjustWholesaleInventory = async (productId: string, adjustment: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from(supabaseTable.inventory_items)
        .update({
          ...adjustment,
          last_updated: new Date().toISOString()
        })
        .eq('wood_product_id', productId);

      if (error) throw error;
      
      toast({
        title: "Inventory Updated",
        description: "Raw materials inventory has been updated successfully."
      });
      
      fetchWholesaleInventory();
      
      return { success: true };
    } catch (error) {
      console.error("Error updating wholesale inventory:", error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update raw materials inventory.",
        variant: "destructive"
      });
      
      return { success: false, error };
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Inventory Master List</h1>
      
      <Tabs defaultValue="packaged" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packaged">Retail Ready Products</TabsTrigger>
          <TabsTrigger value="raw">Raw Materials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packaged" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Packaged Products Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <PackagedProductsTable 
                data={packagesWithDetails} 
                loading={retailLoading}
                isAdmin={isAdmin}
                onInventoryUpdate={adjustInventory}
                onRefresh={fetchRetailInventory}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="raw" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Materials Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <RawMaterialsTable 
                data={rawMaterialsWithDetails} 
                loading={wholesaleLoading}
                isAdmin={isAdmin}
                onInventoryUpdate={adjustWholesaleInventory}
                onRefresh={fetchWholesaleInventory}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
