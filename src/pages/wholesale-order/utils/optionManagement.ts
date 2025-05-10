
import { supabase } from "@/integrations/supabase/client";
import { DropdownOptions } from "../types";
import { toast } from "sonner";

// Type for Supabase operation results
type OptionUpdateResult = {
  success: boolean;
  error?: string;
  options?: DropdownOptions;
};

/**
 * Adds a new option to a specific option field
 */
export const addOption = async (
  field: keyof DropdownOptions,
  newOption: string,
  currentOptions: DropdownOptions
): Promise<OptionUpdateResult> => {
  console.log(`Adding option "${newOption}" to field "${field}"`);
  
  try {
    if (!newOption || newOption.trim() === "") {
      return { 
        success: false, 
        error: "Option cannot be empty" 
      };
    }

    // Create a deep copy of the current options
    const updatedOptions = JSON.parse(JSON.stringify(currentOptions)) as DropdownOptions;
    
    // Ensure the field exists as an array
    if (!Array.isArray(updatedOptions[field])) {
      updatedOptions[field] = [];
    }
    
    // Check if option already exists
    if (updatedOptions[field].includes(newOption)) {
      return { 
        success: false, 
        error: `Option "${newOption}" already exists` 
      };
    }
    
    // Add the new option
    updatedOptions[field] = [...updatedOptions[field], newOption];
    
    // First check if a record exists
    const { data, error: checkError } = await supabase
      .from('wholesale_order_options')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for existing options record:', checkError);
      return { success: false, error: checkError.message };
    }
    
    let dbOperation;
    
    if (data && data.length > 0) {
      // Update existing record
      dbOperation = supabase
        .from('wholesale_order_options')
        .update({ [field]: updatedOptions[field] })
        .eq('id', data[0].id);
    } else {
      // Insert new record
      dbOperation = supabase
        .from('wholesale_order_options')
        .insert([{ [field]: updatedOptions[field] }]);
    }

    const { error } = await dbOperation;

    if (error) {
      console.error('Error saving option to database:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
    
    // Also update wood_products if the option is relevant
    if (field === 'species' || field === 'length' || field === 'thickness') {
      // No update needed for new options
    } else if (field === 'bundleType') {
      // Map to bundle_type in wood_products if needed
      // This is just in case we want to add this feature later
    }

    console.log(`Successfully added option "${newOption}" to field "${field}"`);
    return { 
      success: true, 
      options: updatedOptions 
    };
  } catch (err: any) {
    console.error('Error in addOption:', err);
    return { 
      success: false, 
      error: err.message || "An unknown error occurred" 
    };
  }
};

/**
 * Updates an existing option in a specific option field
 */
export const updateOption = async (
  field: keyof DropdownOptions,
  oldOption: string,
  newOption: string,
  currentOptions: DropdownOptions
): Promise<OptionUpdateResult> => {
  console.log(`Updating option from "${oldOption}" to "${newOption}" in field "${field}"`);
  
  try {
    if (!newOption || newOption.trim() === "") {
      return { 
        success: false, 
        error: "Option cannot be empty" 
      };
    }

    // Create a deep copy of the current options
    const updatedOptions = JSON.parse(JSON.stringify(currentOptions)) as DropdownOptions;
    
    // Ensure the field exists as an array
    if (!Array.isArray(updatedOptions[field])) {
      return { 
        success: false, 
        error: `Field "${field}" does not exist or is not an array` 
      };
    }
    
    // Find the index of the old option
    const optionIndex = updatedOptions[field].indexOf(oldOption);
    
    if (optionIndex === -1) {
      return { 
        success: false, 
        error: `Option "${oldOption}" does not exist` 
      };
    }
    
    // Check if new option already exists (but is not the same as old)
    if (oldOption !== newOption && updatedOptions[field].includes(newOption)) {
      return { 
        success: false, 
        error: `Option "${newOption}" already exists` 
      };
    }
    
    // Update the option
    updatedOptions[field][optionIndex] = newOption;
    
    // Update existing products in wood_products with this attribute if it's a core field
    if (field === 'species' || field === 'length' || field === 'thickness') {
      try {
        const { error: productUpdateError } = await supabase
          .from('wood_products')
          .update({ [field]: newOption })
          .eq(field, oldOption);
        
        if (productUpdateError) {
          console.error('Error updating products in database:', productUpdateError);
        } else {
          console.log(`Updated ${field} from "${oldOption}" to "${newOption}" in wood_products`);
        }
      } catch (err) {
        console.error('Error updating products:', err);
      }
    } else if (field === 'bundleType') {
      // For bundleType, we need to map to bundle_type column in the database
      try {
        const { error: productUpdateError } = await supabase
          .from('wood_products')
          .update({ bundle_type: newOption })
          .eq('bundle_type', oldOption);
        
        if (productUpdateError) {
          console.error('Error updating bundle_type in products:', productUpdateError);
        } else {
          console.log(`Updated bundle_type from "${oldOption}" to "${newOption}" in wood_products`);
        }
      } catch (err) {
        console.error('Error updating bundle_type in products:', err);
      }
    }
    
    // First check if a record exists
    const { data, error: checkError } = await supabase
      .from('wholesale_order_options')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for existing options record:', checkError);
      return { success: false, error: checkError.message };
    }
    
    let dbOperation;
    
    if (data && data.length > 0) {
      // Update existing record
      dbOperation = supabase
        .from('wholesale_order_options')
        .update({ [field]: updatedOptions[field] })
        .eq('id', data[0].id);
    } else {
      // Insert new record
      dbOperation = supabase
        .from('wholesale_order_options')
        .insert([{ [field]: updatedOptions[field] }]);
    }

    const { error } = await dbOperation;

    if (error) {
      console.error('Error updating option in database:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    console.log(`Successfully updated option from "${oldOption}" to "${newOption}" in field "${field}"`);
    
    return { 
      success: true, 
      options: updatedOptions 
    };
  } catch (err: any) {
    console.error('Error in updateOption:', err);
    return { 
      success: false, 
      error: err.message || "An unknown error occurred" 
    };
  }
};

/**
 * Handles option operation and provides toast notifications
 */
export const handleOptionOperation = async (
  operation: 'add' | 'update',
  field: keyof DropdownOptions,
  newOption: string,
  currentOptions: DropdownOptions,
  oldOption?: string
): Promise<DropdownOptions | null> => {
  try {
    const result = operation === 'add'
      ? await addOption(field, newOption, currentOptions)
      : await updateOption(field, oldOption || '', newOption, currentOptions);
    
    if (!result.success) {
      toast.error(result.error || "Operation failed");
      return null;
    }
    
    toast.success(
      operation === 'add' 
        ? `Added option "${newOption}"` 
        : `Updated option to "${newOption}"`
    );
    
    return result.options || null;
  } catch (err) {
    console.error('Error in handleOptionOperation:', err);
    toast.error("An unexpected error occurred");
    return null;
  }
};

// Fetch all wood products to use for option population
export const fetchWoodProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('wood_products')
      .select('species, length, bundle_type, thickness')
      .limit(100);
      
    if (error) {
      console.error('Error fetching wood products:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error in fetchWoodProducts:', err);
    return null;
  }
};

// Extract unique options from wood products
export const extractOptionsFromProducts = (products: any[] | null): Partial<DropdownOptions> => {
  if (!products || products.length === 0) {
    return {};
  }
  
  return {
    species: [...new Set(products.map(p => p.species).filter(Boolean))],
    length: [...new Set(products.map(p => p.length).filter(Boolean))],
    bundleType: [...new Set(products.map(p => p.bundle_type).filter(Boolean))],
    thickness: [...new Set(products.map(p => p.thickness).filter(Boolean))]
  };
};
