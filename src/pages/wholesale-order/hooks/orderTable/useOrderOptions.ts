
import { useState, useCallback } from 'react';
import { DropdownOptions } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useOrderOptions() {
  const [options, setOptions] = useState<DropdownOptions>({
    species: [],
    length: [],
    bundleType: [],
    thickness: [],
    packaging: []
  });
  const [editingField, setEditingField] = useState<keyof DropdownOptions | null>(null);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [newOption, setNewOption] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  const { toast } = useToast();

  const loadOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      // First, try to get options from the wholesale_order_options table
      const { data: optionsData, error: optionsError } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (optionsData) {
        console.log("Loaded options from wholesale_order_options table:", optionsData);
        
        // Add "Pizza Wood Bundle" to species if not already present
        let species = optionsData.species || [];
        if (!species.includes('Pizza Wood')) {
          species = [...species, 'Pizza Wood'];
        }
        
        setOptions({
          species: species,
          length: optionsData.length || [],
          bundleType: optionsData.bundleType || [],
          thickness: optionsData.thickness || [],
          packaging: optionsData.packaging || []
        });
      } else if (optionsError) {
        console.log("Couldn't load from options table, extracting from wood_products");
        // If that fails, extract unique values from wood_products
        const { data: woodProducts, error: woodProductsError } = await supabase
          .from('wood_products')
          .select('species, length, bundle_type, thickness');

        if (woodProductsError) throw woodProductsError;

        if (woodProducts && woodProducts.length > 0) {
          const species = [...new Set(woodProducts.map(p => p.species))];
          // Add "Pizza Wood" if not already present
          if (!species.includes('Pizza Wood')) {
            species.push('Pizza Wood');
          }
          
          const lengths = [...new Set(woodProducts.map(p => p.length))];
          const bundleTypes = [...new Set(woodProducts.map(p => p.bundle_type))];
          const thicknesses = [...new Set(woodProducts.map(p => p.thickness))];
          
          setOptions({
            species,
            length: lengths,
            bundleType: bundleTypes,
            thickness: thicknesses,
            packaging: ['Pallets', 'Boxes (16x12")', 'Boxes (12x10")']
          });
          
          console.log("Created options from wood_products:", {
            speciesCount: species.length,
            lengthCount: lengths.length,
            bundleTypeCount: bundleTypes.length,
            thicknessCount: thicknesses.length
          });
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load options',
        variant: 'destructive'
      });
      
      // Fallback to default options with "Pizza Wood"
      setOptions({
        species: ['Mixed Hardwood', 'Cherry', 'Oak', 'Hickory', 'Ash', 'Pizza Wood'],
        length: ['12"', '16"'],
        bundleType: ['Loose', 'Bundled', 'Premium'],
        thickness: ['Standard Split', 'Thick Split'],
        packaging: ['Pallets', 'Boxes (16x12")', 'Boxes (12x10")']
      });
    } finally {
      setIsLoadingOptions(false);
    }
  }, [toast]);

  return {
    options,
    setOptions,
    editingField,
    setEditingField,
    editingRowId,
    setEditingRowId,
    newOption,
    setNewOption,
    isLoadingOptions,
    loadOptions
  };
}
