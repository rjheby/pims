
export interface InventoryTotals {
  [key: string]: number;
}

export interface InventoryItemDetail {
  name: string;
  quantity: number;
  estimatedPrice: number;
}

export interface ScheduleSummaryData {
  totalStops: number;
  stopsByDriver: Record<string, number>;
  totalPrice: number;
  laborCost: number;
  itemizedInventory: InventoryItemDetail[];
  capacityUtilization: number;
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

// Extract detailed inventory information
export function extractItemizedInventory(stops: any[]): InventoryItemDetail[] {
  // First, gather raw counts
  const itemCounts: Record<string, number> = {};
  
  stops.forEach(stop => {
    if (!stop.items) return;
    
    const itemsList = stop.items.split(',').map((item: string) => item.trim()).filter(Boolean);
    
    itemsList.forEach((itemDescription: string) => {
      if (!itemDescription) return;
      
      // Parse quantity from formats like "2x Firewood" or just count as 1
      const match = itemDescription.match(/^(\d+)x\s+(.+)$/);
      const quantity = match ? parseInt(match[1]) : 1;
      const name = match ? match[2] : itemDescription;
      
      // Standardize the name for consistent grouping
      const standardName = normalizeProductName(name);
      
      // Add to counts
      itemCounts[standardName] = (itemCounts[standardName] || 0) + quantity;
    });
  });
  
  // Convert to array of detailed items with estimated prices
  return Object.entries(itemCounts).map(([name, quantity]) => {
    // Estimate price based on product type and quantity
    // This is a simplified pricing model - could be enhanced with actual product prices
    const basePrice = estimateBasePrice(name);
    const estimatedPrice = basePrice * quantity;
    
    return {
      name,
      quantity,
      estimatedPrice
    };
  }).sort((a, b) => b.quantity - a.quantity); // Sort by quantity descending
}

// Helper function to estimate base price of a product
function estimateBasePrice(productName: string): number {
  const lowerName = productName.toLowerCase();
  
  if (lowerName.includes('cord')) {
    if (lowerName.includes('1/4')) return 120;
    if (lowerName.includes('1/2')) return 220;
    if (lowerName.includes('full')) return 400;
    return 150; // Default cord price
  }
  
  if (lowerName.includes('bundle')) {
    if (lowerName.includes('oak') || lowerName.includes('hickory')) return 15;
    if (lowerName.includes('cherry')) return 18;
    if (lowerName.includes('maple')) return 16;
    return 12; // Default bundle price
  }
  
  if (lowerName.includes('box')) return 25;
  if (lowerName.includes('kindling')) return 10;
  
  return 20; // Default price for unknown items
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

// Calculate capacity utilization based on item types and quantities
export function calculateCapacityUtilization(items: InventoryItemDetail[]): number {
  // This is a simplified model - in a real system, this would be based on
  // actual truck capacity dimensions and product volumes
  
  const totalCapacityUnits = 1000; // Arbitrary capacity units for a truck
  let usedCapacity = 0;
  
  items.forEach(item => {
    const lowerName = item.name.toLowerCase();
    let capacityPerItem = 0;
    
    if (lowerName.includes('cord')) {
      if (lowerName.includes('1/4')) capacityPerItem = 50;
      else if (lowerName.includes('1/2')) capacityPerItem = 100;
      else if (lowerName.includes('full')) capacityPerItem = 200;
      else capacityPerItem = 50;
    } else if (lowerName.includes('bundle')) {
      capacityPerItem = 5;
    } else if (lowerName.includes('box')) {
      capacityPerItem = 10;
    } else if (lowerName.includes('kindling')) {
      capacityPerItem = 2;
    } else {
      capacityPerItem = 5; // Default capacity units
    }
    
    usedCapacity += capacityPerItem * item.quantity;
  });
  
  const utilization = Math.min(100, Math.round((usedCapacity / totalCapacityUnits) * 100));
  return utilization;
}

export function calculateTotals(stops: any[]): ScheduleSummaryData {
  const totalStops = stops.length;
  
  // Count stops by driver
  const stopsByDriver = stops.reduce((acc: Record<string, number>, stop: any) => {
    const driverName = stop.driver_name || 'Unassigned';
    acc[driverName] = (acc[driverName] || 0) + 1;
    return acc;
  }, {});

  // Calculate total price
  const totalPrice = stops.reduce((sum: number, stop: any) => {
    const price = stop.price || 0;
    return sum + Number(price);
  }, 0);

  // Calculate labor cost (15-20% of revenue)
  const laborCost = totalPrice * 0.18; // Using 18% as the middle of 15-20% range

  // Get itemized inventory
  const itemizedInventory = extractItemizedInventory(stops);
  
  // Calculate capacity utilization
  const capacityUtilization = calculateCapacityUtilization(itemizedInventory);

  return {
    totalStops,
    stopsByDriver,
    totalPrice,
    laborCost,
    itemizedInventory,
    capacityUtilization
  };
}

// Format price to display as currency
export function formatPrice(price: number | null): string {
  if (price === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}
