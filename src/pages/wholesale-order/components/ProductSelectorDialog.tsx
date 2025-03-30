
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { OrderItem, emptyOptions, WoodProduct } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: Partial<OrderItem>) => void;
}

export function ProductSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: ProductSelectorDialogProps) {
  const { toast } = useToast();
  const { 
    options = emptyOptions, 
    isAdmin, 
    setOptions,
    setEditingField,
    setNewOption,
    editingField,
    newOption
  } = useWholesaleOrder();
  
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedThickness, setSelectedThickness] = useState("");
  const [selectedBundleType, setSelectedBundleType] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState("Pallets");
  const [unitCost, setUnitCost] = useState(250);
  const [quantity, setQuantity] = useState(1);
  const [popularProducts, setPopularProducts] = useState<WoodProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Create a safe options object that guarantees arrays for all option fields
  const safeOptions = {
    ...emptyOptions,
    ...options,
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      resetForm();
    } else {
      // Load popular products when dialog opens
      loadPopularProducts();
    }
  }, [open]);

  // Load popular products from Supabase
  const loadPopularProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('wood_products')
        .select('*')
        .eq('is_popular', true)
        .order('popularity_rank');
      
      if (error) throw error;
      
      setPopularProducts(data || []);
    } catch (err) {
      console.error('Error loading popular products:', err);
      toast({
        title: "Error",
        description: "Failed to load popular products",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSelect = () => {
    const product: Partial<OrderItem> = {
      species: selectedSpecies,
      length: selectedLength,
      thickness: selectedThickness,
      bundleType: selectedBundleType,
      packaging: selectedPackaging,
      unitCost: unitCost,
      pallets: quantity,
    };
    onSelect(product);
    onOpenChange(false);
  };

  const handlePopularProductSelect = (product: WoodProduct) => {
    setSelectedSpecies(product.species);
    setSelectedLength(product.length);
    setSelectedThickness(product.thickness);
    setSelectedBundleType(product.bundle_type);
    setUnitCost(product.unit_cost || unitCost);
  };

  const resetForm = () => {
    setSelectedSpecies("");
    setSelectedLength("");
    setSelectedThickness("");
    setSelectedBundleType("");
    setSelectedPackaging("Pallets");
    setUnitCost(250);
    setQuantity(1);
    setEditingField(null);
    setNewOption("");
  };

  const handleAddOption = async (field: keyof typeof safeOptions) => {
    if (!newOption.trim()) return;
    
    try {
      // Get the current options for this field, ensuring it's an array
      const currentOptions = Array.isArray(safeOptions[field]) ? 
        safeOptions[field] : 
        [];
      
      // Create a new array with all existing options plus the new one
      const updatedFieldOptions = [...currentOptions, newOption];
      
      // Update the entire options object
      const updatedOptions = {
        ...safeOptions,
        [field]: updatedFieldOptions
      };
      
      // Update options in context
      setOptions(updatedOptions);
      
      // Reset editing state
      setEditingField(null);
      setNewOption("");
      
      toast({
        title: "Success",
        description: `Added new ${field}: ${newOption}`,
      });
    } catch (error) {
      console.error("Failed to add option:", error);
      toast({
        title: "Error",
        description: "Failed to add option",
        variant: "destructive"
      });
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    optionsArray: string[] | undefined
  ) => {
    // Ensure optionsArray is always an array
    const safeOptionsArray = Array.isArray(optionsArray) ? optionsArray : [];
    const fieldKey = label.toLowerCase() as keyof typeof safeOptions;
    
    return (
      <div className="space-y-2">
        <label className="text-lg font-semibold">{label}</label>
        <div className="flex gap-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {safeOptionsArray.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditingField(fieldKey)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {editingField === fieldKey && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder={`Add new ${label.toLowerCase()}`}
              className="flex-1"
            />
            <Button onClick={() => handleAddOption(fieldKey)}>
              Add
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Capacity explanation based on packaging type
  const getCapacityInfo = () => {
    if (selectedPackaging && selectedPackaging.includes('Box')) {
      const boxType = selectedPackaging.includes('16x12') ? '16x12"' : '12x10"';
      const boxesPerPallet = boxType === '16x12"' ? 48 : 60;
      
      return (
        <div className="text-sm text-amber-600 mt-2">
          Note: {boxesPerPallet} boxes ({boxType}) = 1 pallet equivalent for capacity calculations
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <div className="space-y-6 py-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Select Product</h2>
            <p className="text-muted-foreground">
              Choose product attributes or add new options
            </p>
          </div>

          {popularProducts.length > 0 && (
            <div className="space-y-2">
              <label className="text-lg font-semibold">Popular Products</label>
              <Select onValueChange={(value) => {
                const product = popularProducts.find(p => p.id === value);
                if (product) handlePopularProductSelect(product);
              }}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select a popular product" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {popularProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.full_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-6">
            {renderSelect("Species", selectedSpecies, setSelectedSpecies, safeOptions.species)}
            {renderSelect("Length", selectedLength, setSelectedLength, safeOptions.length)}
            {renderSelect("Thickness", selectedThickness, setSelectedThickness, safeOptions.thickness)}
            {renderSelect("BundleType", selectedBundleType, setSelectedBundleType, safeOptions.bundleType)}
            {renderSelect("Packaging", selectedPackaging, setSelectedPackaging, safeOptions.packaging)}
            
            <div className="space-y-2">
              <label className="text-lg font-semibold">Unit Cost</label>
              <Input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                placeholder="Enter unit cost"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <label className="text-lg font-semibold">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                min={1}
              />
              {getCapacityInfo()}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSelect}
              disabled={!selectedSpecies || !selectedLength || !selectedThickness || !selectedBundleType}
            >
              Select
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
