
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface FilterTabProps {
  options: {
    species: string[];
    length: string[];
    bundleType: string[];
    thickness: string[];
    packaging: string[];
  };
  onApplyFilters: (filters: FilterState) => void;
  onClose: () => void;
}

export interface FilterState {
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  minPallets: number;
  maxPallets: number;
  minUnitCost: number;
  maxUnitCost: number;
  showOnlyInProgress: boolean;
}

export function FilterTab({ options, onApplyFilters, onClose }: FilterTabProps) {
  const [filters, setFilters] = useState<FilterState>({
    species: "",
    length: "",
    bundleType: "",
    thickness: "",
    packaging: "",
    minPallets: 0,
    maxPallets: 100,
    minUnitCost: 0,
    maxUnitCost: 1000,
    showOnlyInProgress: false,
  });

  const handleSelectChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleRangeChange = (field: 'minPallets' | 'maxPallets' | 'minUnitCost' | 'maxUnitCost', value: number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field: 'showOnlyInProgress', checked: boolean) => {
    setFilters((prev) => ({ ...prev, [field]: checked }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      species: "",
      length: "",
      bundleType: "",
      thickness: "",
      packaging: "",
      minPallets: 0,
      maxPallets: 100,
      minUnitCost: 0,
      maxUnitCost: 1000,
      showOnlyInProgress: false,
    });
  };

  return (
    <div className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg p-6 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Species Filter */}
        <div className="space-y-2">
          <Label htmlFor="species-filter">Species</Label>
          <Select
            value={filters.species}
            onValueChange={(value) => handleSelectChange("species", value)}
          >
            <SelectTrigger id="species-filter">
              <SelectValue placeholder="All Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Species</SelectItem>
              {options.species.map((species) => (
                <SelectItem key={species} value={species}>
                  {species}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Length Filter */}
        <div className="space-y-2">
          <Label htmlFor="length-filter">Length</Label>
          <Select
            value={filters.length}
            onValueChange={(value) => handleSelectChange("length", value)}
          >
            <SelectTrigger id="length-filter">
              <SelectValue placeholder="All Lengths" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Lengths</SelectItem>
              {options.length.map((length) => (
                <SelectItem key={length} value={length}>
                  {length}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bundle Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="bundleType-filter">Bundle Type</Label>
          <Select
            value={filters.bundleType}
            onValueChange={(value) => handleSelectChange("bundleType", value)}
          >
            <SelectTrigger id="bundleType-filter">
              <SelectValue placeholder="All Bundle Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Bundle Types</SelectItem>
              {options.bundleType.map((bundleType) => (
                <SelectItem key={bundleType} value={bundleType}>
                  {bundleType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thickness Filter */}
        <div className="space-y-2">
          <Label htmlFor="thickness-filter">Thickness</Label>
          <Select
            value={filters.thickness}
            onValueChange={(value) => handleSelectChange("thickness", value)}
          >
            <SelectTrigger id="thickness-filter">
              <SelectValue placeholder="All Thicknesses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Thicknesses</SelectItem>
              {options.thickness.map((thickness) => (
                <SelectItem key={thickness} value={thickness}>
                  {thickness}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Packaging Filter */}
        <div className="space-y-2">
          <Label htmlFor="packaging-filter">Packaging</Label>
          <Select
            value={filters.packaging}
            onValueChange={(value) => handleSelectChange("packaging", value)}
          >
            <SelectTrigger id="packaging-filter">
              <SelectValue placeholder="All Packaging" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Packaging</SelectItem>
              {options.packaging.map((packaging) => (
                <SelectItem key={packaging} value={packaging}>
                  {packaging}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pallets Range */}
        <div className="space-y-2">
          <Label>Pallets Range</Label>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="min-pallets" className="text-xs">Min</Label>
              <Input
                id="min-pallets"
                type="number"
                min={0}
                value={filters.minPallets}
                onChange={(e) => handleRangeChange("minPallets", parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-pallets" className="text-xs">Max</Label>
              <Input
                id="max-pallets"
                type="number"
                min={0}
                value={filters.maxPallets}
                onChange={(e) => handleRangeChange("maxPallets", parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Unit Cost Range */}
        <div className="space-y-2">
          <Label>Unit Cost Range ($)</Label>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor="min-cost" className="text-xs">Min</Label>
              <Input
                id="min-cost"
                type="number"
                min={0}
                value={filters.minUnitCost}
                onChange={(e) => handleRangeChange("minUnitCost", parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-cost" className="text-xs">Max</Label>
              <Input
                id="max-cost"
                type="number"
                min={0}
                value={filters.maxUnitCost}
                onChange={(e) => handleRangeChange("maxUnitCost", parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Show only in-progress */}
        <div className="flex items-center space-x-2">
          <Switch
            id="in-progress"
            checked={filters.showOnlyInProgress}
            onCheckedChange={(checked) => handleToggleChange("showOnlyInProgress", checked)}
          />
          <Label htmlFor="in-progress">Show only in-progress items</Label>
        </div>

        <div className="pt-6 flex flex-col gap-2">
          <Button onClick={handleApplyFilters} className="w-full bg-[#2A4131] hover:bg-[#2A4131]/90">
            Apply Filters
          </Button>
          <Button onClick={handleResetFilters} variant="outline" className="w-full">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
