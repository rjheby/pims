
export const calculatePrice = (items: string): number => {
  if (!items) return 0;
  
  const itemsList = items.split(',');
  return itemsList.length * 10;
};
