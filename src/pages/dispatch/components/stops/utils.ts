
export const calculatePrice = (items: string | null): number => {
  if (!items) return 0;
  
  // Simple logic: $10 per item
  const itemsList = items.split(',').filter(Boolean);
  return itemsList.length * 10;
};
