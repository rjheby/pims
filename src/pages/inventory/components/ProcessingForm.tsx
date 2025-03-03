
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FirewoodProduct, InventoryItem, WoodProduct } from "@/pages/wholesale-order/types";

interface ProcessingFormProps {
  rawMaterials: (InventoryItem & { product?: WoodProduct })[];
  retailProducts: FirewoodProduct[];
  onSubmit: (data: {
    rawMaterialId: string;
    packagesProduced: number;
    retailProductId: number;
    palletsUsed: number;
    notes: string;
  }) => void;
  onCancel: () => void;
}

export function ProcessingForm({
  rawMaterials,
  retailProducts,
  onSubmit,
  onCancel
}: ProcessingFormProps) {
  const [rawMaterialId, setRawMaterialId] = useState<string>("");
  const [retailProductId, setRetailProductId] = useState<string>("");
  const [packagesProduced, setPackagesProduced] = useState<number>(0);
  const [palletsUsed, setPalletsUsed] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  
  const selectedRawMaterial = rawMaterials.find(rm => rm.id === rawMaterialId);
  const isValid = rawMaterialId && retailProductId && packagesProduced > 0 && palletsUsed > 0;
  const hasEnoughPallets = selectedRawMaterial ? palletsUsed <= selectedRawMaterial.pallets_available : false;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !hasEnoughPallets) return;
    
    onSubmit({
      rawMaterialId,
      retailProductId: parseInt(retailProductId),
      packagesProduced,
      palletsUsed,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rawMaterial">Raw Material (Source)</Label>
          <Select 
            value={rawMaterialId} 
            onValueChange={setRawMaterialId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select raw material..." />
            </SelectTrigger>
            <SelectContent>
              {rawMaterials
                .filter(m => m.pallets_available > 0)
                .map(material => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.product?.full_description || 'Unknown'} 
                    ({material.pallets_available} pallets available)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="retailProduct">Retail Product (Produced)</Label>
          <Select 
            value={retailProductId} 
            onValueChange={setRetailProductId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select retail product..." />
            </SelectTrigger>
            <SelectContent>
              {retailProducts.map(product => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.item_full_name || `${product.species} ${product.length} ${product.package_size}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="palletsUsed">Pallets Used</Label>
          <Input
            id="palletsUsed"
            type="number"
            min="0.1"
            step="0.1"
            value={palletsUsed}
            onChange={(e) => setPalletsUsed(parseFloat(e.target.value) || 0)}
            className={!hasEnoughPallets && palletsUsed > 0 ? "border-red-500" : ""}
          />
          {!hasEnoughPallets && palletsUsed > 0 && (
            <p className="text-sm text-red-500">
              Not enough pallets available. Max: {selectedRawMaterial?.pallets_available || 0}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="packagesProduced">Packages Produced</Label>
          <Input
            id="packagesProduced"
            type="number"
            min="1"
            value={packagesProduced}
            onChange={(e) => setPackagesProduced(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes about this processing..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!isValid || !hasEnoughPallets}
        >
          Record Production
        </Button>
      </div>
    </form>
  );
}
