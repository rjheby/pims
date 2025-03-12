
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
    
    // Update the database
    const { error } = await supabase
      .from('wholesale_order_options')
      .update({ [field]: updatedOptions[field] })
      .eq('id', 1);

    if (error) {
      console.error('Error saving option to database:', error);
      return { 
        success: false, 
        error: error.message 
      };
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
    
    // Update the database
    const { error } = await supabase
      .from('wholesale_order_options')
      .update({ [field]: updatedOptions[field] })
      .eq('id', 1);

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
