
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, ChevronUp, RefreshCw, Save, X } from "lucide-react";
import { FirewoodProduct, RetailInventoryItem } from "@/pages/wholesale-order/types";
import { PackagedProductsMobileCard } from "./PackagedProductsMobileCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface PackagedProductsTableProps {
  data: (RetailInventoryItem & { product?: FirewoodProduct })[];
  loading: boolean;
  isAdmin: boolean;
  onInventoryUpdate: (productId: number, adjustment: Partial<RetailInventoryItem>) => Promise<{ success: boolean; error?: any }>;
  onRefresh: () => void;
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
  onRefresh
}: PackagedProductsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAvailable, setNewAvailable] = useState<number>(0);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
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
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No inventory data available
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
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No inventory data available
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
                      <TableHead className="text-center">Available</TableHead>
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
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                  Update
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                        {expandedItems[item.id] && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={isAdmin ? 6 : 5} className="py-2">
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
