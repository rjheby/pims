
// Utility functions for item selection
export const parseItemsString = (itemsString: string | null): { name: string; quantity: number; price?: number }[] => {
  if (!itemsString) return [];

  try {
    const itemsArray = itemsString.split(',').map(item => item.trim());
    return itemsArray
      .map(item => {
        const quantityMatch = item.match(/^(\d+)x\s+(.+?)(?:\s+@\$(\d+\.\d+))?$/);
        if (quantityMatch) {
          return {
            name: quantityMatch[2].trim(),
            quantity: parseInt(quantityMatch[1]),
            price: quantityMatch[3] ? parseFloat(quantityMatch[3]) : undefined
          };
        }
        return null;
      })
      .filter(Boolean) as { name: string; quantity: number; price?: number }[];
  } catch (error) {
    console.error("Failed to parse items string:", error);
    return [];
  }
};

export const formatItemsForOutput = (items: { name: string; quantity: number; price?: number }[]): string => {
  return items
    .map(item => `${item.quantity}x ${item.name}${item.price ? ` @$${item.price}` : ''}`)
    .join(', ');
};
