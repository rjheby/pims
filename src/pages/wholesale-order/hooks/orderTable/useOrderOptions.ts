
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
        setOptions({
          species: optionsData.species || [],
          length: optionsData.length || [],
          bundleType: optionsData.bundleType || [],
          thickness: optionsData.thickness || [],
          packaging: optionsData.packaging || []
        });
      } else if (optionsError) {
        // If that fails, extract unique values from wood_products
        const { data: woodProducts, error: woodProductsError } = await supabase
          .from('wood_products')
          .select('species, length, bundle_type, thickness');

        if (woodProductsError) throw woodProductsError;

        if (woodProducts && woodProducts.length > 0) {
          const species = [...new Set(woodProducts.map(p => p.species))];
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
        }
      }
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load options',
        variant: 'destructive'
      });
      
      // Fallback to default options
      setOptions({
        species: ['Mixed Hardwood', 'Cherry', 'Oak', 'Hickory', 'Ash'],
        length: ['12"', '16"'],
        bundleType: ['Loose', 'Bundled'],
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
