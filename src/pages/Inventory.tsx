
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpDown, X, Plus, Edit } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

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
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("item_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter products based on search and type filter
  const filteredProducts = products.filter(product => {
    // Filter by product type
    if (filterType && product.product_type !== filterType) {
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

  // Sort products based on sort field and direction
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const fieldA = a[sortField as keyof Product];
    const fieldB = b[sortField as keyof Product];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === "asc" 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === "asc"
        ? fieldA - fieldB
        : fieldB - fieldA;
    }
    
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  // Count products by type
  const productTypeCounts = products.reduce((counts, product) => {
    const type = product.product_type;
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Calculate total value of inventory (using lowest price tier for simplicity)
  const totalInventoryValue = products.reduce((total, product) => {
    const lowestPriceTier = product.pricing?.sort((a, b) => a.unit_price - b.unit_price)[0];
    return total + (lowestPriceTier?.unit_price || 0) * product.minimum_quantity;
  }, 0);

  return (
    <div>
      <Card className="shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Inventory Master List</CardTitle>
              <CardDescription className="mt-1">
                {products.length} Products • {Object.keys(productTypeCounts).length} Categories
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Search and filter controls */}
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1.5 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(null)}
                  className={filterType === null ? "bg-[#2A4131]" : ""}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "boxed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("boxed")}
                  className={filterType === "boxed" ? "bg-[#2A4131]" : ""}
                >
                  Boxed
                </Button>
                <Button
                  variant={filterType === "bundled" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("bundled")}
                  className={filterType === "bundled" ? "bg-[#2A4131]" : ""}
                >
                  Bundled
                </Button>
                <Button
                  variant={filterType === "specialty" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("specialty")}
                  className={filterType === "specialty" ? "bg-[#2A4131]" : ""}
                >
                  Specialty
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-md border w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center justify-between">
                        <span>Item Name</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort("item_name")}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center justify-between">
                        <span>Species</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort("species")}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Package Size</TableHead>
                    <TableHead>
                      <div className="flex items-center justify-between">
                        <span>Length</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort("length")}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Split Size</TableHead>
                    <TableHead>
                      <div className="flex items-center justify-between">
                        <span>Min. Qty</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleSort("minimum_quantity")}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Pricing Tiers</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                        No products found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => (
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
                        {isAdmin && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary section */}
            <div className="mt-8 border-t pt-6">
              <div className="bg-[#f3f3f3] rounded-lg p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[#222222] mb-4">Inventory Summary</h3>
                <div className="space-y-3 w-full max-w-sm">
                  {Object.entries(productTypeCounts).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-[#8A898C] capitalize">{type} Products</span>
                      <span className="font-medium text-[#333333]">{count}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium text-[#8A898C]">Total Products</span>
                    <span className="font-medium text-[#333333]">{products.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-medium text-[#1A1F2C]">Total Inventory Value</span>
                    <span className="font-bold text-[#1A1F2C]">
                      {formatPrice(totalInventoryValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin-only Action Buttons */}
            {isAdmin && (
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline"
                  className="border-[#2A4131] text-[#2A4131] hover:bg-[#2A4131]/10"
                >
                  Export Inventory
                </Button>
                <Button className="bg-[#2A4131] hover:bg-[#2A4131]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
