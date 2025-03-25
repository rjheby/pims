
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { OrderItem, emptyOptions } from "../types";
import { useToast } from "@/hooks/use-toast";

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
    options, 
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
  const [quantity, setQuantity] = useState(0);

  // Create a safe options object that guarantees arrays for all option fields
  const safeOptions = {
    ...emptyOptions,
    ...options,
    species: Array.isArray(options?.species) ? options.species : [],
    length: Array.isArray(options?.length) ? options.length : [],
    thickness: Array.isArray(options?.thickness) ? options.thickness : [],
    bundleType: Array.isArray(options?.bundleType) ? options.bundleType : [],
    packaging: Array.isArray(options?.packaging) ? options.packaging : ["Pallets"]
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
    resetForm();
  };

  const resetForm = () => {
    setSelectedSpecies("");
    setSelectedLength("");
    setSelectedThickness("");
    setSelectedBundleType("");
    setSelectedPackaging("Pallets");
    setUnitCost(250);
    setQuantity(0);
    setEditingField(null);
    setNewOption("");
  };

  const handleAddOption = async (field: keyof typeof safeOptions) => {
    if (!newOption.trim()) return;
    
    try {
      // Ensure the field exists as an array
      const currentFieldOptions = Array.isArray(safeOptions[field]) 
        ? safeOptions[field] 
        : [];
      
      // Add new option to the appropriate options array
      const updatedOptions = { ...safeOptions };
      updatedOptions[field] = [...currentFieldOptions, newOption];
      
      // Update options in context
      setOptions(updatedOptions);
      
      // Reset editing state
      setEditingField(null);
      setNewOption("");
      
      toast({
        title: "Success",
        description: `Added new ${field}: ${newOption}`,
      });
      
      console.log("Successfully added option", newOption, "to field", field);
      console.log("Updated options:", updatedOptions);
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
    optionsArray: string[]
  ) => {
    // Ensure optionsArray is always an array
    const safeOptionsArray = Array.isArray(optionsArray) ? optionsArray : [];
    
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
              onClick={() => setEditingField(label.toLowerCase() as any)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {editingField === label.toLowerCase() && (
          <div className="flex gap-2 mt-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder={`Add new ${label.toLowerCase()}`}
              className="flex-1"
            />
            <Button onClick={() => handleAddOption(label.toLowerCase() as any)}>
              Add
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Capacity explanation based on packaging type
  const getCapacityInfo = () => {
    if (selectedPackaging === "12x10\" Boxes") {
      return (
        <div className="text-sm text-amber-600 mt-2">
          Note: 60 boxes (12x10") = 1 pallet equivalent for capacity calculations
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
                min={0}
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
