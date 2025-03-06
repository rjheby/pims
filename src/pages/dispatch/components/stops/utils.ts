
export const calculatePrice = (items: string | null): number => {
  if (!items) return 0;
  
  // Split the items string by commas and filter out empty entries
  const itemsList = items.split(',').map(item => item.trim()).filter(Boolean);
  
  // Calculate price for each item based on its description
  return itemsList.reduce((total, item) => {
    // Default price is $10 per item
    let itemPrice = 10;
    
    // Check for "cord" in the item name to determine firewood price
    if (item.toLowerCase().includes('cord')) {
      if (item.toLowerCase().includes('1/4 cord')) {
        itemPrice = 75;
      } else if (item.toLowerCase().includes('1/2 cord')) {
        itemPrice = 125;
      } else if (item.toLowerCase().includes('full cord')) {
        itemPrice = 200;
      }
    } 
    // Check for kindling
    else if (item.toLowerCase().includes('kindling')) {
      itemPrice = 15;
    }
    // Check for cedar bundle
    else if (item.toLowerCase().includes('cedar')) {
      itemPrice = 12;
    }
    // Check for firestarter
    else if (item.toLowerCase().includes('firestarter')) {
      itemPrice = 8;
    }
    
    return total + itemPrice;
  }, 0);
};
