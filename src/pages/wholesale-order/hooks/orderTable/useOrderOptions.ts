
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
      console.log('Fetching wholesale_order_options from Supabase...');
      
      // First, try to get options from the wholesale_order_options table
      const { data: optionsData, error: optionsError } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (optionsError && optionsError.code !== 'PGRST116') {
        console.error('Error fetching options from wholesale_order_options:', optionsError);
        throw optionsError;
      }

      // If options exist in wholesale_order_options, use them
      if (optionsData) {
        console.log('Options data received from wholesale_order_options:', optionsData);
        setOptions({
          species: optionsData.species || [],
          length: optionsData.length || [],
          bundleType: optionsData.bundleType || [],
          thickness: optionsData.thickness || [],
          packaging: optionsData.packaging || []
        });
        return;
      }

      // If no options in wholesale_order_options, try to extract unique values from wood_products table
      console.log('No options found in wholesale_order_options, extracting from wood_products...');
      
      // Get unique species
      const { data: speciesData } = await supabase
        .from('wood_products')
        .select('species')
        .limit(100);
      
      // Get unique lengths
      const { data: lengthData } = await supabase
        .from('wood_products')
        .select('length')
        .limit(100);
      
      // Get unique bundle types
      const { data: bundleTypeData } = await supabase
        .from('wood_products')
        .select('bundle_type')
        .limit(100);
      
      // Get unique thickness types
      const { data: thicknessData } = await supabase
        .from('wood_products')
        .select('thickness')
        .limit(100);
      
      // Extract unique values
      const uniqueSpecies = [...new Set(speciesData?.map(item => item.species).filter(Boolean) || [])];
      const uniqueLength = [...new Set(lengthData?.map(item => item.length).filter(Boolean) || [])];
      const uniqueBundleType = [...new Set(bundleTypeData?.map(item => item.bundle_type).filter(Boolean) || [])];
      const uniqueThickness = [...new Set(thicknessData?.map(item => item.thickness).filter(Boolean) || [])];
      
      // Default packaging options
      const packagingOptions = ['Pallets', 'Boxes', 'Bundles'];
      
      const generatedOptions = {
        species: uniqueSpecies.length > 0 ? uniqueSpecies : ['Mixed Hardwood', 'Cherry', 'Oak', 'Hickory', 'Ash'],
        length: uniqueLength.length > 0 ? uniqueLength : ['12"', '16"'],
        bundleType: uniqueBundleType.length > 0 ? uniqueBundleType : ['Loose', 'Bundled'],
        thickness: uniqueThickness.length > 0 ? uniqueThickness : ['Standard Split', 'Thick Split'],
        packaging: packagingOptions
      };

      console.log('Generated options from wood_products:', generatedOptions);
      setOptions(generatedOptions);

      // Attempt to create the options record in the database for future use
      try {
        const { error: insertError } = await supabase
          .from('wholesale_order_options')
          .insert([generatedOptions]);
        
        if (insertError) {
          console.error('Error creating options record:', insertError);
        } else {
          console.log('Created new wholesale_order_options record with extracted values');
        }
      } catch (insertErr) {
        console.error('Failed to insert generated options:', insertErr);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dropdown options from database',
        variant: 'destructive'
      });
      
      // Only use fallback options if we couldn't fetch any data at all
      setOptions({
        species: ['Mixed Hardwood', 'Cherry', 'Oak', 'Hickory', 'Ash'],
        length: ['12"', '16"'],
        bundleType: ['Loose', 'Bundled'],
        thickness: ['Standard Split', 'Thick Split'],
        packaging: ['Pallets']
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
