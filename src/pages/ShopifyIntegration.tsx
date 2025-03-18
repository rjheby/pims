
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Check, X } from "lucide-react";
import { ShopifyProduct, ProductMapping } from "./shopify/types";
import { 
  getShopifySettings, 
  saveShopifySettings, 
  fetchShopifyProducts, 
  fetchShopifyProductMappings,
  fetchFirewoodProducts,
  updateProductMapping 
} from "./shopify/mockService";

export default function ShopifyIntegration() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(false);
  const [shopDomain, setShopDomain] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<any[]>([]);
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load connection status and settings
  useEffect(() => {
    async function loadConnectionStatus() {
      try {
        setIsLoading(true);
        
        // Load Shopify connection settings
        const settings = await getShopifySettings();
        
        if (settings) {
          setIsConnected(settings.is_connected);
          setIsAutoSync(settings.auto_sync_enabled);
          setShopDomain(settings.shop_domain || "");
          setApiKey(settings.api_key || "");
          setApiSecret(settings.api_secret ? "••••••••" : "");
          setLastSyncTime(settings.last_sync_time);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    async function loadProductData() {
      try {
        // Load firewood products
        const products = await fetchFirewoodProducts();
        setFirewoodProducts(products || []);
        
        // Load product mappings
        const mappings = await fetchShopifyProductMappings();
        setProductMappings(mappings || []);
      } catch (error) {
        console.error("Error loading product data:", error);
      }
    }
    
    loadConnectionStatus();
    loadProductData();
  }, []);
  
  const handleFetchShopifyProducts = async () => {
    setIsSyncing(true);
    try {
      // Fetch products from Shopify
      const products = await fetchShopifyProducts();
      
      // Add mapping info to products
      const productsWithMapping = products.map(product => {
        const mapping = productMappings.find(m => m.shopify_variant_id === product.variant_id);
        return {
          ...product,
          mapped_to_internal_id: mapping?.firewood_product_id?.toString() || null
        };
      });
      
      setShopifyProducts(productsWithMapping);
      
      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      
      // Update settings with last sync time
      await saveShopifySettings({ last_sync_time: now });
      
      toast({
        title: "Sync Completed",
        description: "Successfully synchronized Shopify products.",
      });
    } catch (error) {
      console.error("Error syncing with Shopify:", error);
      toast({
        title: "Sync Failed",
        description: "There was an issue synchronizing with Shopify.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSaveConnectionSettings = async () => {
    try {
      setIsLoading(true);
      
      await saveShopifySettings({
        shop_domain: shopDomain,
        api_key: apiKey,
        api_secret: apiSecret === "••••••••" ? undefined : apiSecret,
        is_connected: isConnected,
        auto_sync_enabled: isAutoSync,
      });
      
      toast({
        title: "Settings Saved",
        description: "Shopify integration settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving connection settings:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMapProduct = async (shopifyVariantId: string, firewoodProductId: number | null) => {
    try {
      await updateProductMapping(shopifyVariantId, firewoodProductId);
      
      // Update local state
      const updatedProducts = shopifyProducts.map(product => {
        if (product.variant_id === shopifyVariantId) {
          return {
            ...product,
            mapped_to_internal_id: firewoodProductId?.toString() || null
          };
        }
        return product;
      });
      
      setShopifyProducts(updatedProducts);
      
      // Refresh mappings
      const refreshedMappings = await fetchShopifyProductMappings();
      setProductMappings(refreshedMappings || []);
      
      toast({
        title: "Product Mapped",
        description: firewoodProductId ? "Product mapping saved successfully." : "Product mapping removed.",
      });
    } catch (error) {
      console.error("Error mapping product:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the product mapping.",
        variant: "destructive"
      });
    }
  };
  
  const getProductName = (firewoodProductId: number): string => {
    const product = firewoodProducts.find(p => p.id === firewoodProductId);
    return product ? product.item_name : "Unknown Product";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Shopify Integration</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>Configure your Shopify store connection details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shopDomain">Shopify Store Domain</Label>
              <Input 
                id="shopDomain" 
                placeholder="your-store.myshopify.com" 
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input 
                id="apiKey" 
                placeholder="Shopify API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input 
                id="apiSecret" 
                placeholder={apiSecret ? "••••••••" : "Shopify API Secret"}
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isConnected" 
                checked={isConnected} 
                onCheckedChange={setIsConnected}
              />
              <Label htmlFor="isConnected">Connection Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="isAutoSync" 
                checked={isAutoSync} 
                onCheckedChange={setIsAutoSync}
              />
              <Label htmlFor="isAutoSync">Auto-Sync Enabled</Label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveConnectionSettings}>
              Save Connection Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Shopify Products</CardTitle>
              <CardDescription>
                Map Shopify products to your internal inventory
                {lastSyncTime && (
                  <span className="block text-sm text-muted-foreground">
                    Last synchronized: {new Date(lastSyncTime).toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </div>
            
            <Button onClick={handleFetchShopifyProducts} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Products
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shopifyProducts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {isSyncing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>Loading products from Shopify...</p>
                </div>
              ) : (
                <p>No Shopify products found. Click "Sync Products" to fetch your products.</p>
              )}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Internal Product</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopifyProducts.map((product) => (
                    <TableRow key={product.variant_id}>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.variant_title}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.inventory_quantity}</TableCell>
                      <TableCell>
                        <select 
                          className="w-full border rounded-md py-1 px-3"
                          value={product.mapped_to_internal_id || ""}
                          onChange={(e) => handleMapProduct(
                            product.variant_id, 
                            e.target.value ? Number(e.target.value) : null
                          )}
                        >
                          <option value="">-- Select Product --</option>
                          {firewoodProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.item_name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        {product.mapped_to_internal_id ? (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <Check className="h-4 w-4" />
                            <span>Mapped to {getProductName(Number(product.mapped_to_internal_id))}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <X className="h-4 w-4" />
                            <span>Not mapped</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
