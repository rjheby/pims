
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Save, X, Copy, Trash, Edit } from "lucide-react";
import { InventoryItem, WoodProduct } from "@/pages/wholesale-order/types";

interface RawMaterialsMobileCardProps {
  item: InventoryItem & { product?: WoodProduct };
  isAdmin: boolean;
  onInventoryUpdate?: (productId: string, adjustment: Partial<InventoryItem>) => Promise<{ success: boolean; error?: any }>;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function RawMaterialsMobileCard({
  item,
  isAdmin,
  onInventoryUpdate,
  onDuplicate,
  onDelete
}: RawMaterialsMobileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newAvailable, setNewAvailable] = useState<number>(Number(item.pallets_available));

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  const handleEdit = () => {
    setEditing(true);
    setNewAvailable(Number(item.pallets_available));
  };

  const handleSave = async () => {
    try {
      if (!onInventoryUpdate) return;
      
      const adjustment = newAvailable - Number(item.pallets_available);
      const newTotal = Number(item.total_pallets) + adjustment;
      
      const result = await onInventoryUpdate(item.wood_product_id, {
        pallets_available: newAvailable,
        total_pallets: newTotal
      });
      
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div onClick={toggleExpanded} className="flex items-center gap-2 cursor-pointer flex-1">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="font-medium truncate">
            {item.product?.full_description || 'Unknown Product'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={Number(item.pallets_available) === 0 ? "text-red-500" : "text-green-600"}>
            {item.pallets_available} pallets
          </span>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 pt-0 grid gap-3">
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Available:</Label>
            {editing ? (
              <Input
                type="number"
                min="0"
                value={newAvailable}
                onChange={(e) => setNewAvailable(parseInt(e.target.value) || 0)}
                className="h-8"
              />
            ) : (
              <div className={Number(item.pallets_available) === 0 ? "text-red-500" : "text-green-600"}>
                {item.pallets_available}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Allocated:</Label>
            <div>{item.pallets_allocated}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Total:</Label>
            <div>{item.total_pallets}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 items-center">
            <Label>Last Updated:</Label>
            <div>{new Date(item.last_updated).toLocaleDateString()}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <span className="text-sm font-medium">Species:</span>
              <span className="text-sm ml-1">{item.product?.species || '-'}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Length:</span>
              <span className="text-sm ml-1">{item.product?.length || '-'}</span>
            </div>
            <div>
              <span className="text-sm font-medium">Thickness:</span>
              <span className="text-sm ml-1">{item.product?.thickness || '-'}</span>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex flex-wrap gap-2 mt-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleEdit} disabled={!onInventoryUpdate}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  {onDuplicate && (
                    <Button variant="outline" size="sm" onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-1" /> Duplicate
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={onDelete} className="border-red-600 text-red-600 hover:bg-red-50">
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

