
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

export default function Inventory() {
  const { hasPermission } = useUser();
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
                onRefresh={fetchWholesaleInventory}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
