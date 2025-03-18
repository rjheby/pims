
// This file contains utility functions and constants for stops management

// Calculate price based on items
export const calculatePrice = (items: string | null): number => {
  if (!items) return 0;
  
  // Simple logic: $10 per item
  const itemsList = items.split(',') || [];
  return itemsList.length * 10;
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
