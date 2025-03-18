
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
