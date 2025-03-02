
import { useInvoicesDue } from "@/pages/wholesale-order/hooks/useInvoicesDue";
import { useRetailInventory } from "@/pages/wholesale-order/hooks/useRetailInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InvoicesDueCard() {
  const { invoicesDue, loading: invoicesLoading } = useInvoicesDue();
  const { retailInventory, loading: inventoryLoading } = useRetailInventory();
  
  // Calculate total retail packages
  const totalRetailPackages = retailInventory.reduce((sum, item) => sum + item.packages_available, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoices">Invoices Due</TabsTrigger>
            <TabsTrigger value="inventory">Retail Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invoices" className="space-y-4">
            <CardTitle className="text-sm font-medium">
              Supplier Invoices Due Next 45 Days
            </CardTitle>
            {invoicesLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ${invoicesDue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <CardTitle className="text-sm font-medium">
              Available Retail Packages
            </CardTitle>
            <div className="flex items-center">
              {inventoryLoading ? (
                <Skeleton className="h-8 w-[100px]" />
              ) : (
                <div className="text-2xl font-bold text-green-600 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  {totalRetailPackages.toLocaleString()} packages
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
