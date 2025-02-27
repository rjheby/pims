
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown } from "lucide-react";

interface Product {
  id: number;
  item_name: string;
  package_size: string;
  species: string;
  length: string;
  split_size: string;
  minimum_quantity: number;
  product_type: string;
  pricing: PricingTier[];
}

interface PricingTier {
  price_tier_name: string;
  quantity_min: number;
  quantity_max: number | null;
  unit_price: number;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('firewood_products')
        .select(`
          *,
          pricing:product_pricing(*)
        `)
        .order('product_type, item_name');

      if (productsError) throw productsError;

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatQuantityRange = (min: number, max: number | null) => {
    if (!max) return `${min}+`;
    return `${min}-${max}`;
  };

  const filteredProducts = products.filter(product => {
    // Filter by tab
    if (activeTab !== "all" && product.product_type !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.item_name.toLowerCase().includes(searchLower) ||
        product.species.toLowerCase().includes(searchLower) ||
        product.package_size.toLowerCase().includes(searchLower) ||
        product.length.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Inventory Master List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search and filter controls */}
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </Button>
              </div>

              {/* Product type tabs */}
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Products</TabsTrigger>
                  <TabsTrigger value="boxed">Boxed</TabsTrigger>
                  <TabsTrigger value="bundled">Bundled</TabsTrigger>
                  <TabsTrigger value="specialty">Specialty</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  {renderProductTable(filteredProducts)}
                </TabsContent>
                <TabsContent value="boxed" className="mt-6">
                  {renderProductTable(filteredProducts)}
                </TabsContent>
                <TabsContent value="bundled" className="mt-6">
                  {renderProductTable(filteredProducts)}
                </TabsContent>
                <TabsContent value="specialty" className="mt-6">
                  {renderProductTable(filteredProducts)}
                </TabsContent>
              </Tabs>

              {/* Summary section */}
              <div className="mt-8 border-t pt-6">
                <div className="bg-[#f3f3f3] rounded-lg p-6 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-[#222222] mb-4">Inventory Summary</h3>
                  <div className="space-y-3 w-full max-w-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Total Products</span>
                      <span className="font-medium text-[#333333]">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Boxed Products</span>
                      <span className="font-medium text-[#333333]">
                        {products.filter(p => p.product_type === 'boxed').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Bundled Products</span>
                      <span className="font-medium text-[#333333]">
                        {products.filter(p => p.product_type === 'bundled').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A898C]">Specialty Products</span>
                      <span className="font-medium text-[#333333]">
                        {products.filter(p => p.product_type === 'specialty').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline"
                  className="border-[#2A4131] text-[#2A4131] hover:bg-[#2A4131]/10"
                >
                  Export Inventory
                </Button>
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  Add New Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  function renderProductTable(products: Product[]) {
    return (
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">
                <div className="flex items-center justify-between">
                  <span>Item Name</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="w-[10%]">Species</TableHead>
              <TableHead className="w-[13%]">Package Size</TableHead>
              <TableHead className="w-[10%]">Length</TableHead>
              <TableHead className="w-[10%]">Split Size</TableHead>
              <TableHead className="w-[10%]">Min. Quantity</TableHead>
              <TableHead className="w-[25%] text-right">Pricing Tiers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.item_name}</TableCell>
                  <TableCell>{product.species}</TableCell>
                  <TableCell>{product.package_size}</TableCell>
                  <TableCell>{product.length}</TableCell>
                  <TableCell>{product.split_size}</TableCell>
                  <TableCell>{product.minimum_quantity}</TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      {product.pricing?.map((tier, index) => (
                        <div key={index} className="text-sm">
                          {tier.price_tier_name}: {formatPrice(tier.unit_price)}
                          <span className="text-gray-500 text-xs ml-1">
                            ({formatQuantityRange(tier.quantity_min, tier.quantity_max)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
}
