
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
  const { options, isAdmin, handleUpdateOptions } = useWholesaleOrder();
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedThickness, setSelectedThickness] = useState("");
  const [selectedBundleType, setSelectedBundleType] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  const handleSelect = () => {
    const product: Partial<OrderItem> = {
      species: selectedSpecies,
      length: selectedLength,
      thickness: selectedThickness,
      bundleType: selectedBundleType,
      packaging: "Pallets", // Default
      unitCost: 250, // Default
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
    setEditingField(null);
    setNewOptionValue("");
  };

  const handleAddOption = async (field: string) => {
    if (!newOptionValue.trim()) return;
    
    try {
      await handleUpdateOptions(field as any, newOptionValue);
      setEditingField(null);
      setNewOptionValue("");
    } catch (error) {
      console.error("Failed to add option:", error);
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
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
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
            onClick={() => setEditingField(label)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      {editingField === label && (
        <div className="flex gap-2 mt-2">
          <Input
            value={newOptionValue}
            onChange={(e) => setNewOptionValue(e.target.value)}
            placeholder={`Add new ${label.toLowerCase()}`}
            className="flex-1"
          />
          <Button onClick={() => handleAddOption(label.toLowerCase())}>
            Add
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6 py-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Select Product</h2>
            <p className="text-muted-foreground">
              Choose a product or search for one by attributes
            </p>
          </div>

          <div className="grid gap-6">
            {renderSelect("Species", selectedSpecies, setSelectedSpecies, options.species)}
            {renderSelect("Length", selectedLength, setSelectedLength, options.length)}
            {renderSelect("Bundle Type", selectedBundleType, setSelectedBundleType, options.bundleType)}
            {renderSelect("Thickness", selectedThickness, setSelectedThickness, options.thickness)}
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
