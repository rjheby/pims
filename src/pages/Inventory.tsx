
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

  const ProductTable = ({ products }: { products: Product[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Name</TableHead>
          <TableHead>Species</TableHead>
          <TableHead>Package Size</TableHead>
          <TableHead>Length</TableHead>
          <TableHead>Split Size</TableHead>
          <TableHead>Min. Quantity</TableHead>
          <TableHead className="text-right">Pricing Tiers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
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
        ))}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Inventory Master List</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="boxed">Boxed</TabsTrigger>
              <TabsTrigger value="bundled">Bundled</TabsTrigger>
              <TabsTrigger value="specialty">Specialty</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ProductTable products={products} />
            </TabsContent>

            <TabsContent value="boxed">
              <ProductTable products={products.filter(p => p.product_type === 'boxed')} />
            </TabsContent>

            <TabsContent value="bundled">
              <ProductTable products={products.filter(p => p.product_type === 'bundled')} />
            </TabsContent>

            <TabsContent value="specialty">
              <ProductTable products={products.filter(p => p.product_type === 'specialty')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
