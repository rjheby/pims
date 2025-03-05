
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, RefreshCw, Save, X, Copy, Trash, Plus, Edit } from "lucide-react";
import { InventoryItem, WoodProduct } from "@/pages/wholesale-order/types";
import { RawMaterialsMobileCard } from "./RawMaterialsMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface RawMaterialsTableProps {
  data: (InventoryItem & { product?: WoodProduct })[];
  loading: boolean;
  isAdmin: boolean;
  onInventoryUpdate?: (productId: string, adjustment: Partial<InventoryItem>) => Promise<{ success: boolean; error?: any }>;
  onRefresh: () => void;
  onDuplicate?: (item: InventoryItem) => void;
  onDelete?: (item: InventoryItem) => void;
  onAdd?: () => void;
}

export function RawMaterialsTable({
  data,
  loading,
  isAdmin,
  onInventoryUpdate,
  onRefresh,
  onDuplicate,
  onDelete,
  onAdd
}: RawMaterialsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAvailable, setNewAvailable] = useState<number>(0);
  const isMobile = useIsMobile();
  
  // Organize products into groups
  const groupedProducts = useMemo(() => {
    const groups: Record<string, (InventoryItem & { product?: WoodProduct })[]> = {};
    
    data.forEach(item => {
      // Extract product type (pallets, bundles, etc.)
      const productType = item.product?.product_type || 'Other';
      const groupKey = productType;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    // Sort groups alphabetically
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setNewAvailable(Number(item.pallets_available));
  };

  const handleSave = async (item: InventoryItem) => {
    try {
      if (!onInventoryUpdate) return;
      
      const adjustment = newAvailable - Number(item.pallets_available);
      const newTotal = Number(item.total_pallets) + adjustment;
      
      const result = await onInventoryUpdate(item.wood_product_id, {
        pallets_available: newAvailable,
        total_pallets: newTotal
      });
      
      if (result.success) {
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={onAdd} disabled={!onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No raw materials data available
            </div>
          ) : (
            groupedProducts.map(([groupName, items]) => (
              <div key={groupName} className="space-y-3">
                <div 
                  className="font-medium text-lg bg-muted py-2 px-3 rounded-md cursor-pointer flex items-center"
                  onClick={() => toggleGroup(groupName)}
                >
                  {expandedGroups[groupName] ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  {groupName}
                </div>
                
                {expandedGroups[groupName] && (
                  <div className="space-y-3 ml-4">
                    {items.map((item) => (
                      <RawMaterialsMobileCard
                        key={item.id}
                        item={item}
                        isAdmin={isAdmin}
                        onInventoryUpdate={onInventoryUpdate}
                        onDuplicate={onDuplicate ? () => onDuplicate(item) : undefined}
                        onDelete={onDelete ? () => onDelete(item) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between">
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onAdd} disabled={!onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No raw materials data available
        </div>
      ) : (
        <div className="space-y-6">
          {groupedProducts.map(([groupName, items]) => (
            <div key={groupName} className="rounded-md border">
              <div 
                className="bg-muted px-4 py-2 font-medium cursor-pointer flex items-center"
                onClick={() => toggleGroup(groupName)}
              >
                {expandedGroups[groupName] ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                {groupName}
              </div>
              
              {expandedGroups[groupName] && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Product</TableHead>
                      <TableHead className="text-center">Available Pallets</TableHead>
                      <TableHead className="text-center">Allocated</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Last Updated</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <>
                        <TableRow key={item.id}>
                          <TableCell>
                            <div 
                              className="flex items-center space-x-2 cursor-pointer"
                              onClick={() => toggleItem(item.id)}
                            >
                              {expandedItems[item.id] ? (
                                <ChevronUp className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="font-medium whitespace-normal break-words">
                                {item.product?.full_description || 'Unknown Product'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {editingId === item.id ? (
                              <Input
                                type="number"
                                min="0"
                                value={newAvailable}
                                onChange={(e) => setNewAvailable(parseInt(e.target.value) || 0)}
                                className="h-8 w-20 text-center mx-auto"
                              />
                            ) : (
                              <span className={Number(item.pallets_available) === 0 ? "text-red-500" : "text-green-600"}>
                                {item.pallets_available}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.pallets_allocated}</TableCell>
                          <TableCell className="text-center">{item.total_pallets}</TableCell>
                          <TableCell className="text-center">
                            {new Date(item.last_updated).toLocaleDateString()}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right">
                              {editingId === item.id ? (
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleSave(item)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleEdit(item)}
                                    disabled={!onInventoryUpdate}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {onDuplicate && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => onDuplicate(item)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => onDelete(item)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                        {expandedItems[item.id] && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={isAdmin ? 6 : 5} className="py-2">
                              <div className="grid grid-cols-3 gap-4 px-8">
                                <div>
                                  <span className="text-sm font-medium">Species:</span>
                                  <span className="text-sm ml-2">{item.product?.species || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Length:</span>
                                  <span className="text-sm ml-2">{item.product?.length || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Thickness:</span>
                                  <span className="text-sm ml-2">{item.product?.thickness || '-'}</span>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

