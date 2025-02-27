
import { useState, useEffect } from "react";
import { OrderTableRow } from "./components/OrderTableRow";
import { OrderTableMobileRow } from "./components/OrderTableMobileRow";
import { useOrderTable } from "./hooks/useOrderTable";
import { BaseOrderTable } from "@/components/templates/BaseOrderTable";
import { OrderItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterIcon, Search, X } from "lucide-react";
import { FilterTab, FilterState } from "./components/FilterTab";

interface OrderTableProps {
  readOnly?: boolean;
  onItemsChange?: (items: OrderItem[]) => void;
}

export function OrderTable({ readOnly = false, onItemsChange }: OrderTableProps) {
  const {
    items,
    options,
    isAdmin,
    editingField,
    newOption,
    compressedStates,
    optionFields,
    handleKeyPress,
    handleUpdateItem,
    handleRemoveRow,
    handleCopyRow,
    handleAddItem,
    generateItemName,
    handleUpdateOptions,
    toggleCompressed,
    setNewOption,
  } = useOrderTable();

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [filteredItems, setFilteredItems] = useState<OrderItem[]>(items);

  // Call the onItemsChange callback whenever items change
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  // Apply filters and search
  useEffect(() => {
    let result = [...items];

    // Apply active filters if they exist
    if (activeFilters) {
      result = result.filter(item => {
        // Check species filter
        if (activeFilters.species && item.species !== activeFilters.species) {
          return false;
        }
        
        // Check length filter
        if (activeFilters.length && item.length !== activeFilters.length) {
          return false;
        }
        
        // Check bundleType filter
        if (activeFilters.bundleType && item.bundleType !== activeFilters.bundleType) {
          return false;
        }
        
        // Check thickness filter
        if (activeFilters.thickness && item.thickness !== activeFilters.thickness) {
          return false;
        }
        
        // Check packaging filter
        if (activeFilters.packaging && item.packaging !== activeFilters.packaging) {
          return false;
        }
        
        // Check pallets range
        const pallets = Number(item.pallets) || 0;
        if (pallets < activeFilters.minPallets || pallets > activeFilters.maxPallets) {
          return false;
        }
        
        // Check unit cost range
        const unitCost = Number(item.unitCost) || 0;
        if (unitCost < activeFilters.minUnitCost || unitCost > activeFilters.maxUnitCost) {
          return false;
        }

        return true;
      });
    }
    
    // Apply search if it exists (separate from filters)
    if (searchValue) {
      const lowerSearchValue = searchValue.toLowerCase();
      result = result.map(item => {
        // Generate a searchable string from all properties
        const searchableString = Object.values(item)
          .filter(val => val !== undefined && val !== null)
          .join(" ")
          .toLowerCase();
        
        // Also add the generated name for searchability
        const itemName = generateItemName(item).toLowerCase();
        
        // Check if the search term is found
        const matchFound = searchableString.includes(lowerSearchValue) || 
                          itemName.includes(lowerSearchValue);
        
        // Return the item with an added highlight property
        return {
          ...item,
          highlight: matchFound
        };
      });
    }

    // Apply sorting if it exists
    if (sortConfig) {
      result.sort((a, b) => {
        // Handle sorting for special fields
        if (sortConfig.key === 'name') {
          const aName = generateItemName(a).toLowerCase();
          const bName = generateItemName(b).toLowerCase();
          
          if (aName < bName) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aName > bName) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        
        // Handle sorting for normal fields
        const aValue = a[sortConfig.key as keyof OrderItem];
        const bValue = b[sortConfig.key as keyof OrderItem];
        
        // Handle number values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string values
        if (aValue && bValue) {
          return sortConfig.direction === 'asc' 
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
        
        // Handle undefined or null values
        if (!aValue && bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue && !bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        return 0;
      });
    }

    setFilteredItems(result);
  }, [items, sortConfig, searchValue, activeFilters, generateItemName]);

  const headers = [
    { key: 'name', label: 'Name', sortable: true },
    ...optionFields.map(field => ({
      key: field,
      label: field.charAt(0).toUpperCase() + field.slice(1),
      sortable: true
    })),
    { key: 'pallets', label: 'Qty', sortable: true },
    { key: 'unitCost', label: 'Unit Cost', sortable: true },
    { key: 'totalCost', label: 'Total Cost', sortable: true },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = filteredItems.map(item => ({
    ...item,
    name: generateItemName(item),
    totalCost: (item.pallets || 0) * (item.unitCost || 0)
  }));

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    setFilterOpen(false);
  };

  const clearActiveFilters = () => {
    setActiveFilters(null);
  };

  const activeFilterCount = activeFilters 
    ? Object.entries(activeFilters).filter(([key, value]) => {
        if (key === 'minPallets' && value === 0) return false;
        if (key === 'maxPallets' && value === 100) return false;
        if (key === 'minUnitCost' && value === 0) return false;
        if (key === 'maxUnitCost' && value === 1000) return false;
        if (key === 'showOnlyInProgress' && value === false) return false;
        if (typeof value === 'string' && value === '') return false;
        return true;
      }).length
    : 0;

  return (
    <>
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1.5 h-6 w-6 p-0"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Filter Button */}
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setFilterOpen(true)}
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Active Filters Indicator */}
          {activeFilterCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearActiveFilters}
              className="text-sm text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="hidden md:block">
          <div className="overflow-x-auto w-full" style={{width: '100%'}}>
            <BaseOrderTable
              headers={headers}
              data={tableData}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            >
              {tableData.map(item => (
                <OrderTableRow
                  key={item.id}
                  item={item}
                  options={options}
                  isAdmin={isAdmin}
                  editingField={editingField}
                  newOption={newOption}
                  onNewOptionChange={setNewOption}
                  onKeyPress={handleKeyPress}
                  onUpdateItem={handleUpdateItem}
                  onRemoveRow={handleRemoveRow}
                  onCopyRow={handleCopyRow}
                  onAddItem={handleAddItem}
                  generateItemName={generateItemName}
                  onUpdateOptions={handleUpdateOptions}
                  isCompressed={!!compressedStates[item.id]}
                  onToggleCompressed={toggleCompressed}
                  readOnly={readOnly}
                  highlight={item.highlight}
                />
              ))}
            </BaseOrderTable>
          </div>
        </div>

        <div className="md:hidden">
          <div className="grid gap-4">
            {tableData.map(item => (
              <OrderTableMobileRow
                key={item.id}
                item={item}
                options={options}
                isAdmin={isAdmin}
                editingField={editingField}
                newOption={newOption}
                isCompressed={!!compressedStates[item.id]}
                optionFields={optionFields}
                onNewOptionChange={setNewOption}
                onKeyPress={handleKeyPress}
                onUpdateItem={handleUpdateItem}
                onUpdateOptions={handleUpdateOptions}
                onRemoveRow={handleRemoveRow}
                onCopyRow={handleCopyRow}
                onAddItem={handleAddItem}
                onToggleCompressed={toggleCompressed}
                generateItemName={generateItemName}
                readOnly={readOnly}
                highlight={item.highlight}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tab Drawer */}
      {filterOpen && (
        <FilterTab 
          options={options}
          onApplyFilters={handleApplyFilters}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </>
  );
}
