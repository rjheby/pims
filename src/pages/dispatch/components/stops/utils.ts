
/**
 * Calculate the price based on the items string
 * Format: "2x Firewood - 1/4 cord, 1x Kindling bundle"
 */
export const calculatePrice = (items: string | null): number => {
  if (!items) return 0;
  
  // Parse the items string and calculate a simple price
  // In a real app, this would look up actual product prices
  let totalPrice = 0;
  
  // Split by comma to get individual items
  const itemsArray = items.split(',').map(item => item.trim()).filter(Boolean);
  
  itemsArray.forEach(item => {
    // Extract quantity and description
    const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
    
    // Calculate price based on description keywords (simplified logic)
    if (item.toLowerCase().includes('cord')) {
      // Cord items are more expensive
      totalPrice += quantity * 150;
    } else if (item.toLowerCase().includes('bundle')) {
      // Bundles are cheaper
      totalPrice += quantity * 25;
    } else {
      // Default price for other items
      totalPrice += quantity * 50;
    }
  });
  
  return totalPrice;
};

/**
 * Formats a price with currency symbol
 */
export const formatPrice = (price: number | undefined): string => {
  if (price === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * Available recurrence options for deliveries
 */
export const recurrenceOptions = [
  { value: 'none', label: 'One-time Delivery' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every Two Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom Schedule' }
];

/**
 * Day of week options for recurring deliveries
 */
export const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];
