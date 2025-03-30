
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
      const { data, error } = await supabase
        .from('wholesale_order_options')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setOptions({
          species: data.species || [],
          length: data.length || [],
          bundleType: data.bundleType || [],
          thickness: data.thickness || [],
          packaging: data.packaging || []
        });
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
