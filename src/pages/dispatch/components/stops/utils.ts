// This file contains utility functions and constants for stops management

// Calculate price based on items and their quantities
export const calculatePrice = (items: string, quantities?: number[], prices?: number[]): number => {
  console.log("calculatePrice called with:", { items, quantities, prices });
  
  if (!items) {
    console.log("No items provided, returning 0");
    return 0;
  }
  
  try {
    const itemList = items.split(',').map(item => item.trim());
    console.log("Split items into:", itemList);
    
    let totalPrice = 0;
    
    // Handle case with provided quantities and prices arrays
    if (quantities && prices && quantities.length === prices.length) {
      console.log("Using provided quantities and prices arrays");
      totalPrice = quantities.reduce((sum, quantity, index) => {
        const price = prices[index] || 0;
        const itemTotal = quantity * price;
        console.log(`Item ${index + 1}: ${quantity} x $${price} = $${itemTotal}`);
        return sum + itemTotal;
      }, 0);
    }
    // Parse prices from item strings (format: "3x Widget @$10.00")
    else {
      console.log("Parsing prices from item strings");
      totalPrice = itemList.reduce((sum, item) => {
        // Format: "3x Widget @$10.00"
        const matches = item.match(/(\d+)x\s+(.+?)\s+@\$(\d+\.\d+)/);
        if (matches) {
          const quantity = parseInt(matches[1]);
          const price = parseFloat(matches[3]);
          const itemTotal = quantity * price;
          console.log(`Parsed item: ${quantity} x $${price} = $${itemTotal}`);
          return sum + itemTotal;
        }
        console.log(`No price info found in item: ${item}`);
        return sum;
      }, 0);
    }
    
    console.log("Final calculated price:", totalPrice);
    return totalPrice;
  } catch (error) {
    console.error("Error calculating price:", error);
    return 0;
  }
};

// Format price to display as currency
export const formatPrice = (price: number | null): string => {
  if (price === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

// Options for recurrence frequency
export const recurrenceOptions = [
  { value: 'none', label: 'None' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' }
];

// Options for preferred delivery days
export const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];
