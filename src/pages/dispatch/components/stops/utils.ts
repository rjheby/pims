
// This file contains utility functions and constants for stops management

// Calculate price based on items and their quantities
export const calculatePrice = (items: string | null, quantities?: number[], prices?: number[]): number => {
  if (!items) return 0;
  
  let totalPrice = 0;
  
  // If quantities and prices arrays are provided, use them directly
  if (quantities && prices && quantities.length === prices.length) {
    for (let i = 0; i < quantities.length; i++) {
      totalPrice += quantities[i] * prices[i];
    }
    return totalPrice;
  }
  
  // Fallback to string parsing if arrays aren't provided
  const itemsList = items.split(',').map(item => item.trim()).filter(Boolean);
  
  // Parse items for quantities and prices
  itemsList.forEach(item => {
    // Check for quantity format like "30x Pizza Split Bundles @$7.50"
    const quantityMatch = item.match(/^(\d+)x\s+(.+?)(?:\s+@\$(\d+(?:\.\d+)?))?$/);
    if (quantityMatch) {
      const quantity = parseInt(quantityMatch[1], 10);
      const price = quantityMatch[3] ? parseFloat(quantityMatch[3]) : 10; // Default price if not specified
      totalPrice += quantity * price;
    } else {
      // If no quantity specified, assume quantity of 1
      totalPrice += 10; // Default price
    }
  });
  
  return totalPrice;
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
