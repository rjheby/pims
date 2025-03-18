
export interface InventoryTotals {
  [key: string]: number;
}

export function calculateInventoryTotals(stops: any[]): InventoryTotals {
  const inventoryTotals: InventoryTotals = {};
  
  // Loop through each stop and count items
  stops.forEach(stop => {
    if (!stop.items) return;
    
    // Parse items from the stop
    const itemsList = stop.items.split(',').map((item: string) => item.trim()).filter(Boolean);
    
    // Add each item to the totals
    itemsList.forEach((item: string) => {
      if (!item) return;
      inventoryTotals[item] = (inventoryTotals[item] || 0) + 1;
    });
  });
  
  return inventoryTotals;
}

// Helper function to normalize product names for consistent display
export function normalizeProductName(itemDescription: string): string {
  // Parse format like "2x Firewood - 1/4 cord"
  const match = itemDescription.match(/^(\d+)x\s+(.+)$/);
  if (!match) return itemDescription;
  
  const quantity = match[1];
  const description = match[2];
  
  // Extract common name by removing detailed specifications
  // This handles formats like "Firewood - 1/4 cord, Cherry, 16 inch"
  const commonNameMatch = description.match(/^([^,\-]+)(?:\s*[-,].*)?$/);
  const commonName = commonNameMatch ? commonNameMatch[1].trim() : description;
  
  return `${quantity}x ${commonName}`;
}

export function calculateTotals(stops: any[]) {
  const totalStops = stops.length;
  
  // Count stops by driver
  const totalByDriver = stops.reduce((acc: Record<string, number>, stop: any) => {
    const driverName = stop.driver_name || 'Unassigned';
    acc[driverName] = (acc[driverName] || 0) + 1;
    return acc;
  }, {});

  // Calculate total price
  const totalPrice = stops.reduce((sum: number, stop: any) => {
    const price = stop.price || 0;
    return sum + Number(price);
  }, 0);

  // Get inventory totals
  const inventoryTotals = calculateInventoryTotals(stops);

  return {
    totalQuantity: totalStops,
    quantityByPackaging: totalByDriver,
    totalValue: totalPrice,
    inventoryTotals: inventoryTotals
  };
}
