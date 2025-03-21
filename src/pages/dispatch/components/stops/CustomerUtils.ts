
import { Customer } from "./types";

// Popular customers for priority sorting
const POPULAR_CUSTOMERS = [
  "paulie g",
  "numero 28 brooklyn",
  "sunday in brooklyn"
];

/**
 * Get a popularity score for a customer based on name matching
 */
export const getPopularityScore = (name: string): number => {
  const normalizedName = name.toLowerCase();
  const index = POPULAR_CUSTOMERS.findIndex(popular => 
    normalizedName.includes(popular.toLowerCase())
  );
  return index >= 0 ? POPULAR_CUSTOMERS.length - index : 0;
};

/**
 * Construct a full address string from address parts
 */
export const constructAddress = (customer: any): string => {
  const parts = [
    customer.street_address,
    customer.city,
    customer.state,
    customer.zip_code
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : '';
};

/**
 * Sort customers by popularity score then alphabetically
 */
export const sortCustomersByPopularity = (customers: Customer[]): Customer[] => {
  return [...customers].sort((a, b) => {
    const scoreA = getPopularityScore(a.name);
    const scoreB = getPopularityScore(b.name);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score (more popular) first
    }
    
    return a.name.localeCompare(b.name);
  });
};
