
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  RetailInventoryItem, 
  FirewoodProduct,
  InventoryItem,
  WoodProduct
} from "./wholesale-order/types";
import { useRetailInventory } from "./wholesale-order/hooks/useRetailInventory";
import { useWholesaleInventory } from "./wholesale-order/hooks/useWholesaleInventory";
import { PackagedProductsTable } from "./inventory/components/PackagedProductsTable";
import { RawMaterialsTable } from "./inventory/components/RawMaterialsTable";
import { ProcessingForm } from "./inventory/components/ProcessingForm";
import { supabase } from "@/integrations/supabase/client";

export default function InventoryManagement() {
  const { hasPermission } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("packaged");
  const [showProcessingForm, setShowProcessingForm] = useState(false);
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

  const handleProcessSubmit = async (data: {
    rawMaterialId: string;
    packagesProduced: number;
    retailProductId: number;
    palletsUsed: number;
    notes: string;
  }) => {
    try {
      // Step 1: Update retail inventory (add packages produced)
      await adjustInventory(data.retailProductId, {
        packages_available: data.packagesProduced,
        total_packages: data.packagesProduced
      });
      
      // Step 2: Update wholesale inventory (reduce pallets)
      const { error } = await supabase
        .from('inventory_items')
        .update({ 
          pallets_available: supabase.rpc('decrement', { 
            x: data.palletsUsed,
            row_id: data.rawMaterialId,
            column_name: 'pallets_available'
          }),
          total_pallets: supabase.rpc('decrement', { 
            x: data.palletsUsed,
            row_id: data.rawMaterialId,
            column_name: 'total_pallets'
          }),
          last_updated: new Date().toISOString() 
        })
        .eq('id', data.rawMaterialId);

      if (error) throw error;
      
      // Step 3: Record the processing event
      const conversionRatio = data.packagesProduced / data.palletsUsed;
      const { error: recordError } = await supabase
        .from('processing_records')
        .insert({
          wood_product_id: data.rawMaterialId,
          firewood_product_id: data.retailProductId,
          wholesale_pallets_used: data.palletsUsed,
          retail_packages_created: data.packagesProduced,
          actual_conversion_ratio: conversionRatio,
          processed_by: 'Admin', // Should be replaced with actual user name
          notes: data.notes
        });
        
      if (recordError) throw recordError;
      
      // Refresh data
      fetchRetailInventory();
      fetchWholesaleInventory();
      
      toast({
        title: "Processing Recorded",
        description: `Successfully added ${data.packagesProduced} packages to inventory`,
      });
      
      setShowProcessingForm(false);
    } catch (error) {
      console.error("Error processing inventory:", error);
      toast({
        title: "Error",
        description: "Failed to process inventory",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        {isAdmin && (
          <Button onClick={() => setShowProcessingForm(!showProcessingForm)}>
            {showProcessingForm ? "Cancel" : "Record Production"}
          </Button>
        )}
      </div>
      
      {showProcessingForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record Production</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcessingForm 
              rawMaterials={rawMaterialsWithDetails} 
              retailProducts={firewoodProducts}
              onSubmit={handleProcessSubmit}
              onCancel={() => setShowProcessingForm(false)}
            />
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="packaged" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packaged">Packaged Products</TabsTrigger>
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
