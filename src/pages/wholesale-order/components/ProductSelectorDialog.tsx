
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
import { OrderItem } from "../types";
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

  const handleSelect = () => {
    const product: Partial<OrderItem> = {
      species: selectedSpecies,
      length: selectedLength,
      thickness: selectedThickness,
      bundleType: selectedBundleType,
      packaging: selectedPackaging,
      unitCost: unitCost,
      pallets: 0,
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
    setEditingField(null);
    setNewOption("");
  };

  const handleAddOption = async (field: keyof typeof options) => {
    if (!newOption.trim()) return;
    
    try {
      // Add new option to the appropriate options array
      const updatedOptions = { ...options };
      updatedOptions[field] = [...options[field], newOption];
      
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
    options: string[]
  ) => (
    <div className="space-y-2">
      <label className="text-lg font-semibold">{label}</label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {options.map((option) => (
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
            {renderSelect("Species", selectedSpecies, setSelectedSpecies, options.species)}
            {renderSelect("Length", selectedLength, setSelectedLength, options.length)}
            {renderSelect("Thickness", selectedThickness, setSelectedThickness, options.thickness)}
            {renderSelect("BundleType", selectedBundleType, setSelectedBundleType, options.bundleType)}
            {renderSelect("Packaging", selectedPackaging, setSelectedPackaging, options.packaging)}
            
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
