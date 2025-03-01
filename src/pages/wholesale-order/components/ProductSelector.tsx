
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { WoodProduct } from '../types';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProductSelectorProps {
  onSelect: (product: WoodProduct) => void;
  onCancel: () => void;
  initialValues?: {
    species?: string;
    length?: string;
    bundleType?: string;
    thickness?: string;
  };
}

export function ProductSelector({ onSelect, onCancel, initialValues }: ProductSelectorProps) {
  // State
  const [products, setProducts] = useState<WoodProduct[]>([]);
  const [popularProducts, setPopularProducts] = useState<WoodProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<WoodProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'search' | 'attributes'>('search');
  
  // Selected attributes
  const [selectedSpecies, setSelectedSpecies] = useState(initialValues?.species || '');
  const [selectedLength, setSelectedLength] = useState(initialValues?.length || '');
  const [selectedBundleType, setSelectedBundleType] = useState(initialValues?.bundleType || '');
  const [selectedThickness, setSelectedThickness] = useState(initialValues?.thickness || '');
  
  // Derived attributes lists
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [lengthList, setLengthList] = useState<string[]>([]);
  const [bundleTypeList, setBundleTypeList] = useState<string[]>([]);
  const [thicknessList, setThicknessList] = useState<string[]>([]);

  // Fetch products from Supabase
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Fetch all products
        const { data: allProducts, error: allProductsError } = await supabase
          .from('wood_products')
          .select('*')
          .order('full_description');
          
        if (allProductsError) throw allProductsError;
        
        // Fetch popular products
        const { data: topProducts, error: popularProductsError } = await supabase
          .from('wood_products')
          .select('*')
          .eq('is_popular', true)
          .order('popularity_rank')
          .limit(10);
          
        if (popularProductsError) throw popularProductsError;
        
        if (allProducts) {
          setProducts(allProducts);
          
          // Extract unique attribute values
          setSpeciesList([...new Set(allProducts.map(p => p.species))]);
          setLengthList([...new Set(allProducts.map(p => p.length))]);
          setBundleTypeList([...new Set(allProducts.map(p => p.bundle_type))]);
          setThicknessList([...new Set(allProducts.map(p => p.thickness))]);
        }
        
        if (topProducts) {
          setPopularProducts(topProducts);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = products.filter(product => 
        product.full_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  // Filter products based on selected attributes
  useEffect(() => {
    if (selectionMode === 'attributes' && (selectedSpecies || selectedLength || selectedBundleType || selectedThickness)) {
      const filtered = products.filter(product => {
        const matchesSpecies = !selectedSpecies || product.species === selectedSpecies;
        const matchesLength = !selectedLength || product.length === selectedLength;
        const matchesBundleType = !selectedBundleType || product.bundle_type === selectedBundleType;
        const matchesThickness = !selectedThickness || product.thickness === selectedThickness;
        
        return matchesSpecies && matchesLength && matchesBundleType && matchesThickness;
      });
      
      setFilteredProducts(filtered);
    }
  }, [selectedSpecies, selectedLength, selectedBundleType, selectedThickness, selectionMode, products]);

  // Handle selection of a product by attributes
  const handleAttributeSelection = () => {
    // Find product that matches all selected attributes
    const matchingProduct = products.find(product => 
      product.species === selectedSpecies &&
      product.length === selectedLength &&
      product.bundle_type === selectedBundleType &&
      product.thickness === selectedThickness
    );
    
    if (matchingProduct) {
      onSelect(matchingProduct);
    } else {
      // If no exact match, show all filtered products
      setSearchTerm('');
      setSelectionMode('search');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Select Product</DialogTitle>
        <DialogDescription>
          Choose a product or search for one by attributes
        </DialogDescription>
      </DialogHeader>
      
      {/* Mode switcher */}
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={selectionMode === 'search' ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectionMode('search')}
          className="flex-1"
        >
          Search
        </Button>
        <Button 
          variant={selectionMode === 'attributes' ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectionMode('attributes')}
          className="flex-1"
        >
          Select Attributes
        </Button>
      </div>
      
      {/* Search mode */}
      {selectionMode === 'search' && (
        <div className="space-y-4">
          {/* Popular products */}
          <div>
            <label className="block text-sm font-medium mb-1">Popular Products</label>
            <Select 
              onValueChange={(value) => {
                const product = products.find(p => p.id === value);
                if (product) onSelect(product);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a popular product" />
              </SelectTrigger>
              <SelectContent>
                {popularProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.full_description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium mb-1">Search All Products</label>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search products..."
                className="pl-8"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
      
      {/* Attribute selection mode */}
      {selectionMode === 'attributes' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Species</label>
            <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
              <SelectTrigger>
                <SelectValue placeholder="Select species" />
              </SelectTrigger>
              <SelectContent>
                {speciesList.map((species) => (
                  <SelectItem key={species} value={species}>{species}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <Select value={selectedLength} onValueChange={setSelectedLength}>
              <SelectTrigger>
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                {lengthList.map((length) => (
                  <SelectItem key={length} value={length}>{length}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bundle Type</label>
            <Select value={selectedBundleType} onValueChange={setSelectedBundleType}>
              <SelectTrigger>
                <SelectValue placeholder="Select bundle type" />
              </SelectTrigger>
              <SelectContent>
                {bundleTypeList.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Thickness</label>
            <Select value={selectedThickness} onValueChange={setSelectedThickness}>
              <SelectTrigger>
                <SelectValue placeholder="Select thickness" />
              </SelectTrigger>
              <SelectContent>
                {thicknessList.map((thickness) => (
                  <SelectItem key={thickness} value={thickness}>{thickness}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAttributeSelection} 
            className="col-span-2 mt-2"
            disabled={!selectedSpecies || !selectedLength || !selectedBundleType || !selectedThickness}
          >
            Select Product
          </Button>
        </div>
      )}
      
      {/* Search results */}
      {filteredProducts.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Result' : 'Results'}
          </label>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            <ul className="divide-y">
              {filteredProducts.map((product) => (
                <li 
                  key={product.id} 
                  className="p-3 hover:bg-gray-50 cursor-pointer flex flex-col"
                  onClick={() => onSelect(product)}
                >
                  <div className="font-medium">{product.full_description}</div>
                  <div className="text-sm text-gray-500">${product.unit_cost.toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button variant="outline" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
        <Button 
          onClick={() => {
            const matchingProduct = products.find(product => 
              product.species === selectedSpecies &&
              product.length === selectedLength &&
              product.bundle_type === selectedBundleType &&
              product.thickness === selectedThickness
            );
            
            if (matchingProduct && selectionMode === 'attributes') {
              onSelect(matchingProduct);
            }
          }} 
          disabled={selectionMode === 'attributes' && (!selectedSpecies || !selectedLength || !selectedBundleType || !selectedThickness)}
        >
          Select
        </Button>
      </div>
    </div>
  );
}
