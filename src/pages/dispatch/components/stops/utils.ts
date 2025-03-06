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

export const isStatusDelivered = (status: string | undefined): boolean => {
  return status?.toLowerCase() === 'delivered';
};

export const isStatusCanceled = (status: string | undefined): boolean => {
  return status?.toLowerCase() === 'canceled';
};

export const getNextStatusText = (status: string | undefined): string => {
  const currentStatus = status?.toLowerCase() || 'pending';
  
  switch (currentStatus) {
    case 'pending':
      return 'Mark in process';
    case 'in process':
      return 'Mark scheduled';
    case 'scheduled':
      return 'Mark loaded';
    case 'loaded':
      return 'Mark out for delivery';
    case 'out for delivery':
      return 'Mark delivered';
    case 'delivered':
      return 'Already delivered';
    case 'canceled':
      return 'Restart as pending';
    default:
      return 'Update status';
  }
};

export const getNextStatus = (status: string | undefined): string => {
  const currentStatus = status?.toLowerCase() || 'pending';
  
  switch (currentStatus) {
    case 'pending':
      return 'in process';
    case 'in process':
      return 'scheduled';
    case 'scheduled':
      return 'loaded';
    case 'loaded':
      return 'out for delivery';
    case 'out for delivery':
      return 'delivered';
    case 'delivered':
      return 'delivered'; // No change
    case 'canceled':
      return 'pending'; // Reset to pending
    default:
      return currentStatus;
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Keep only numbers
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  return phone;
};
