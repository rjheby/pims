
import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, RefreshCw, Save, X, Copy, Trash, Plus, Edit } from "lucide-react";
import { FirewoodProduct, RetailInventoryItem } from "@/pages/wholesale-order/types";
import { PackagedProductsMobileCard } from "./PackagedProductsMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";

interface PackagedProductsTableProps {
  data: (RetailInventoryItem & { product?: FirewoodProduct })[];
  loading: boolean;
  isAdmin: boolean;
  onInventoryUpdate: (productId: number, adjustment: Partial<RetailInventoryItem>) => Promise<{ success: boolean; error?: any }>;
  onRefresh: () => void;
  onDuplicate?: (item: RetailInventoryItem) => void;
  onDelete?: (item: RetailInventoryItem) => void;
  onAdd?: () => void;
}

// Helper function to determine product type
const getProductType = (product?: FirewoodProduct): string => {
  if (!product) return 'Unknown';
  
  // Extract packaging type
  const packaging = product.product_type || 'Other';
  
  // Extract bundle type
  let bundleType = 'Other';
  if (product.package_size?.toLowerCase().includes('bundled')) {
    bundleType = 'Bundled';
  } else if (product.package_size?.toLowerCase().includes('loose')) {
    bundleType = 'Loose';
  }
  
  return `${packaging} - ${bundleType}`;
};

// Helper function to simplify split size display
const simplifyDisplayName = (text?: string): string => {
  if (!text) return '';
  
  return text
    .replace('thick split', 'thick')
    .replace('thin split', 'thin');
};

export function PackagedProductsTable({
  data,
  loading,
  isAdmin,
  onInventoryUpdate,
  onRefresh,
  onDuplicate,
  onDelete,
  onAdd
}: PackagedProductsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAvailable, setNewAvailable] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  // Organize products into groups
  const groupedProducts = useMemo(() => {
    const groups: Record<string, (RetailInventoryItem & { product?: FirewoodProduct })[]> = {};
    
    data.forEach(item => {
      const groupKey = getProductType(item.product);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    // Sort groups alphabetically
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  // Initialize expanded state for all groups when data changes
  useEffect(() => {
    const initialGroups: Record<string, boolean> = {};
    groupedProducts.forEach(([groupName]) => {
      // If it's a new group, expand by default
      if (expandedGroups[groupName] === undefined) {
        initialGroups[groupName] = true;
      } else {
        initialGroups[groupName] = expandedGroups[groupName];
      }
    });
    setExpandedGroups(initialGroups);
  }, [groupedProducts]);

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

  const handleEdit = (item: RetailInventoryItem) => {
    setEditingId(item.id);
    setNewAvailable(item.packages_available);
  };

  const handleSave = async (item: RetailInventoryItem) => {
    try {
      const adjustment = newAvailable - item.packages_available;
      const newTotal = item.total_packages + adjustment;
      
      const result = await onInventoryUpdate(item.firewood_product_id, {
        packages_available: newAvailable,
        total_packages: newTotal
      });
      
      if (result.success) {
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleItemSelection = (id: string, index: number, event?: React.MouseEvent) => {
    if (event?.shiftKey && lastSelectedIndex !== null) {
      // Find all items between the last selected item and this one
      const flattenedItems = data.map(item => item.id);
      const startIdx = Math.min(lastSelectedIndex, index);
      const endIdx = Math.max(lastSelectedIndex, index);
      const itemsInRange = flattenedItems.slice(startIdx, endIdx + 1);
      
      setSelectedItems(prev => {
        // Create a set from previous selections
        const currentSelections = new Set(prev);
        
        // Add all items in range
        itemsInRange.forEach(id => currentSelections.add(id));
        
        return Array.from(currentSelections);
      });
    } else {
      setSelectedItems(prev => {
        if (prev.includes(id)) {
          return prev.filter(itemId => itemId !== id);
        } else {
          return [...prev, id];
        }
      });
      setLastSelectedIndex(index);
    }
  };

  const handleSelectAll = (groupItems: (RetailInventoryItem & { product?: FirewoodProduct })[]) => {
    const groupIds = groupItems.map(item => item.id);
    
    // Check if all items in this group are already selected
    const allSelected = groupIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      // Deselect all items in this group
      setSelectedItems(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      // Select all items in this group
      setSelectedItems(prev => {
        const currentSelections = new Set(prev);
        groupIds.forEach(id => currentSelections.add(id));
        return Array.from(currentSelections);
      });
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedItems.length > 0 && onDuplicate) {
      selectedItems.forEach(id => {
        const item = data.find(item => item.id === id);
        if (item) {
          onDuplicate(item);
        }
      });
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0 && onDelete) {
      selectedItems.forEach(id => {
        const item = data.find(item => item.id === id);
        if (item) {
          onDelete(item);
        }
      });
      setSelectedItems([]);
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
        
        {selectedItems.length > 0 && (
          <div className="flex justify-between items-center bg-muted/40 p-2 rounded-md">
            <span className="text-sm font-medium">{selectedItems.length} selected</span>
            <div className="flex gap-2">
              {onDuplicate && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDuplicateSelected}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory data available
            </div>
          ) : (
            groupedProducts.map(([groupName, items]) => (
              <div key={groupName} className="space-y-3">
                <div className="flex items-center">
                  <Checkbox 
                    id={`select-all-${groupName}`}
                    checked={items.every(item => selectedItems.includes(item.id))}
                    onCheckedChange={() => handleSelectAll(items)}
                    className="mr-2"
                  />
                  <div 
                    className="font-medium text-lg bg-muted py-2 px-3 rounded-md cursor-pointer flex items-center flex-grow"
                    onClick={() => toggleGroup(groupName)}
                  >
                    {expandedGroups[groupName] ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    {groupName}
                  </div>
                </div>
                
                {expandedGroups[groupName] && (
                  <div className="space-y-3 ml-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex items-start">
                        <Checkbox 
                          id={`select-item-${item.id}`}
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => handleItemSelection(item.id, index)}
                          className="mr-2 mt-4"
                        />
                        <div className="flex-grow">
                          <PackagedProductsMobileCard
                            key={item.id}
                            item={{
                              ...item,
                              product: item.product ? {
                                ...item.product,
                                item_name: simplifyDisplayName(item.product.item_name)
                              } : undefined
                            }}
                            isAdmin={isAdmin}
                            onInventoryUpdate={onInventoryUpdate}
                            onDuplicate={onDuplicate ? () => onDuplicate(item) : undefined}
                            onDelete={onDelete ? () => onDelete(item) : undefined}
                          />
                        </div>
                      </div>
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
      
      {selectedItems.length > 0 && (
        <div className="flex justify-between items-center bg-muted/40 p-2 rounded-md">
          <span className="text-sm font-medium">{selectedItems.length} selected</span>
          <div className="flex gap-2">
            {onDuplicate && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDuplicateSelected}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteSelected}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No inventory data available
        </div>
      ) : (
        <div className="space-y-6">
          {groupedProducts.map(([groupName, items]) => (
            <div key={groupName} className="rounded-md border">
              <div className="bg-muted px-4 py-2 font-medium flex items-center">
                <Checkbox 
                  id={`select-all-desktop-${groupName}`}
                  checked={items.every(item => selectedItems.includes(item.id))}
                  onCheckedChange={() => handleSelectAll(items)}
                  className="mr-2"
                />
                <div 
                  className="cursor-pointer flex-grow flex items-center"
                  onClick={() => toggleGroup(groupName)}
                >
                  {expandedGroups[groupName] ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  {groupName}
                </div>
              </div>
              
              {expandedGroups[groupName] && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="text-center">Product</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="text-center">Allocated</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-center">Last Updated</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <>
                        <TableRow key={item.id} className={selectedItems.includes(item.id) ? "bg-muted/30" : ""}>
                          <TableCell className="p-2">
                            <Checkbox 
                              id={`select-item-desktop-${item.id}`}
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleItemSelection(item.id, index, window.event as React.MouseEvent)}
                            />
                          </TableCell>
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
                                {simplifyDisplayName(item.product?.item_name) || 'Unknown Product'}
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
                              <span className={item.packages_available === 0 ? "text-red-500" : "text-green-600"}>
                                {item.packages_available}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.packages_allocated}</TableCell>
                          <TableCell className="text-center">{item.total_packages}</TableCell>
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
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
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
                            <TableCell colSpan={isAdmin ? 7 : 6} className="py-2">
                              <div className="grid grid-cols-3 gap-4 px-8">
                                <div>
                                  <span className="text-sm font-medium">Size:</span>
                                  <span className="text-sm ml-2">{item.product?.package_size || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Species:</span>
                                  <span className="text-sm ml-2">{item.product?.species || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Length:</span>
                                  <span className="text-sm ml-2">{item.product?.length || '-'}</span>
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
